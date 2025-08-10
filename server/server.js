const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3'); // Клиент S3 для взаимодействия с s3 хранилищем(selectel)
const { Upload } = require('@aws-sdk/lib-storage'); // Утилита для удобной загрузки файлов в S3
const cookieParser = require('cookie-parser');
const session = require('express-session');

const path = require('path'); // Для работы с путями файлов (если потребуется)
require('dotenv').config();        //dev
require('dotenv').config({ path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`) });       //production



const app = express();
//Опция trust proxy говорит Express.js, что он работает за прокси-сервером (например, Nginx). Это позволяет ему корректно обрабатывать заголовки X-Forwarded-For и другие, которые передаёт прокси, и правильно определять IP-адрес клиента и домен.
app.set('trust proxy', 1);

const port = process.env.PORT || 3000; // Используем порт из .env или по умолчанию 3000

// --- Глобальные Middleware ---
// 1. CORS Middleware: Разрешает запросы с вашего фронтенда.
app.use(cors({
    origin: ['http://localhost:5173', 'http://31.129.33.133'], //меняй внешний ip
    credentials: true // Разрешить отправку куки и заголовков авторизации
}));

// 2. Body Parsers: Для обработки входящих JSON и URL-encoded данных.
// Multer будет обрабатывать multipart/form-data для файловых загрузок.
app.use(express.json({ limit: '50mb' })); // Увеличиваем лимит для JSON тела запроса
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Увеличиваем лимит для URL-encoded тела запроса
app.use(cookieParser());       // Инициализируем cookie-parser



// --- Настройка Selectel S3 с AWS SDK v3 ---
// Создаем экземпляр S3Client для взаимодействия с S3-совместимым хранилищем (Selectel)
const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID, // Ваши ключи доступа Selectel
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY, // Ваши секретные ключи Selectel
    },
    region: process.env.S3_REGION, // Регион Selectel (например, 'ru-1')
    endpoint: process.env.S3_ENDPINT, // Эндпоинт для Selectel S3 (например, 'https://s3.selcdn.ru')
    forcePathStyle: true, // Важно для S3-совместимых хранилищ, использующих Path-style адресацию
});

// --- Настройка Multer для обработки загрузки файлов ---
// Multer теперь будет временно хранить файл в памяти (`req.file.buffer`),
// а затем мы вручную загрузим его в S3 с помощью AWS SDK v3.
// мы отправялем файлы (фото на сервер при помощи multer)
const upload = multer({
    storage: multer.memoryStorage(), // Файл будет доступен в req.file.buffer
    limits: {
        fileSize: 50 * 1024 * 1024, // Лимит размера файла до 50 МБ
    },
    fileFilter: (req, file, cb) => {
        // Фильтрация типов файлов: разрешаем только изображения
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];// webp -скорее всего данный тип файлов не работает во всех браузерах
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true); // Разрешить загрузку
        } else {
            // Отклонить загрузку с сообщением об ошибке
            cb(new Error('Invalid file type. Only image files (jpeg, png, gif, webp) are allowed.'), false);
        }
    }
});


// --- Middleware для верификации JWT токена ---
//главная задача  данного Middleware — убедиться, что каждый запрос, который он обрабатывает, исходит от авторизованного пользователя.
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Проверяем наличие заголовка Authorization и его формат 'Bearer token'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Требуется авторизация: токен не предоставлен или неверный формат." });
    }

    const token = authHeader.split(' ')[1]; // Извлекаем токен из заголовка

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Верифицируем токен
        req.user = decoded; // Добавляем декодированные данные пользователя в объект запроса
        next(); // Передаем управление следующему middleware или обработчику маршрута
    } catch (err) {
        console.error('Ошибка верификации токена:', err);
        return res.status(401).json({ error: "Неверный или просроченный токен." });
    }
};


// --- Конфигурация подключения к базе данных MySQL (использование Connection Pool) ---
const pool = mysql.createPool({
    host: process.env.DB_HOST, // Адрес вашего MySQL сервера
    user: process.env.DB_USER, // Ваше имя пользователя MySQL
    password: process.env.DB_PASSWORD, // Ваш пароль MySQL 
    database: process.env.DB_DATABASE, // Имя вашей базы данных
    waitForConnections: true, // Будет ли пул ждать, пока станет доступно соединение
    connectionLimit: process.env.DB_CONNECTION_LIMIT, // Максимальное количество одновременно открытых соединений
    queueLimit: 0 // Максимальное количество запросов, которые могут стоять в очереди   0 значает, что очередь не ограничена.
});

// Проверка подключения к базе данных (опционально, но полезно)
pool.getConnection()
    .then(connection => {
        console.log('Подключено к базе данных MySQL через пул!');
        connection.release(); // Освобождаем соединение обратно в пул
    })
    .catch(err => {
        console.error('Ошибка получения подключения из пула (БД недоступна):', err.stack);
        // В реальном приложении здесь можно предусмотреть graceful shutdown или логирование
    });


// --- API Эндпоинты ---

// 1. API-эндпоинт для получения всех пользователей
app.get('/api/data', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, firstName, lastName, email FROM user'); // Выбираем нужные поля
        res.json(rows);
    } catch (error) {
        console.error('Ошибка выполнения запроса /api/data:', error);
        res.status(500).json({ error: 'Ошибка сервера при получении данных пользователей.' });
    }
});

// 2. API-эндпоинт для получения всех записей 'animals'
app.get('/api/animals', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM animals');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка выполнения запроса /api/animals:', error);
        res.status(500).json({ error: 'Ошибка сервера при получении данных животных.' });
    }
});

// 3. API-эндпоинт для регистрации пользователя (SignUp)
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Все поля обязательны для заполнения.' });
    }

    try {
        // Проверяем, существует ли пользователь с таким email
        const [existingUsers] = await pool.execute(
            'SELECT id FROM user WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Пользователь с таким email уже зарегистрирован.' });
        }

        // Хешируем пароль для безопасного хранения
        const hashedPassword = await bcrypt.hash(password, 10);

        // Вставляем нового пользователя в БД
        const [result] = await pool.execute(
            'INSERT INTO user (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword]
        );

        res.status(201).json({ message: 'Пользователь успешно зарегистрирован!', userId: result.insertId });

    } catch (error) {
        console.error('Ошибка во время регистрации пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера при регистрации.' });
    }
});

// 4. API-эндпоинт для входа пользователя (Login)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email и пароль обязательны.' });
    }

    try {
        // Находим пользователя по email
        const [users] = await pool.execute(
            'SELECT id, firstName, lastName, email, password FROM user WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Неверные учетные данные (email или пароль).' });
        }

        const user = users[0];
        const hashedPassword = user.password;

        // Сравниваем предоставленный пароль с хешированным
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordValid) {
            console.log('Ошибка во время регистрации пользователя:', 'Неверные учетные данные (email или пароль).');
            return res.status(401).json({ message: 'Неверные учетные данные (email или пароль).' });
        }

        // Генерируем JWT токен
        const token = jwt.sign({
                userId: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Токен истекает через 24 часа
        );

        res.cookie('authToken', token, {
            httpOnly: false, // Защита от XSS-атак работает только при  https 
            // Устанавливаем secure: true только если протокол HTTPS
            // req.protocol будет 'http' или 'https' благодаря 'trust proxy' и Nginx
            secure: req.protocol === 'https', 
            sameSite: 'Lax', // Защита от CSRF-атак
            maxAge: 24 * 60 * 60 * 1000 // Время жизни cookie (24 часа)
        });

        res.status(200).json({
            message: 'Вход успешно выполнен!',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Ошибка во время входа пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера при входе.' });
    }
});

// 5. Эндпоинт для получения данных текущего пользователя
app.get('/api/me', authMiddleware, async (req, res) => {
    try {
        // req.user уже содержит userId из токена, благодаря authMiddleware
        const [users] = await pool.execute(
            'SELECT id, firstName, lastName, email FROM user WHERE id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        res.json(users[0]);
        
    } catch (error) {
        console.error('Ошибка в /api/me:', error);
        res.status(500).json({ message: 'Ошибка сервера.' });
    }
});

// 6. Эндпоинт для смены пароля пользователя
app.put('/api/user/change-password', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Текущий и новый пароли обязательны.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Новый пароль должен быть минимум 6 символов.' });
    }

    try {
        // Получаем хешированный пароль пользователя из БД
        const [users] = await pool.execute(
            'SELECT password, id, firstName, lastName, email FROM user WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден.' });
        }

        const user = users[0];
        // Проверяем совпадение текущего пароля
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Неверный текущий пароль.' });
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Обновляем пароль в БД
        await pool.execute(
            'UPDATE user SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        // Генерируем новый токен с актуальными данными пользователя (хорошая практика после смены пароля)
        const newToken = jwt.sign({
                userId: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Пароль успешно обновлен!',
            token: newToken,
            user: { // Возвращаем обновленные данные пользователя
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Ошибка при смене пароля:', error);
        res.status(500).json({ error: 'Ошибка сервера.' });
    }
});

// 7. Эндпоинт для обновления имени пользователя
app.put('/api/user/update-name', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { newUserName } = req.body; // Получаем новое имя

    if (!newUserName) {
        return res.status(400).json({ error: 'Имя пользователя обязательно.' });
    }

    if (newUserName.length < 2) {
        return res.status(400).json({ error: 'Имя должно состоять минимум из 2 символов.' });
    }

    try {
        // Обновляем имя в БД
        await pool.execute(
            'UPDATE user SET firstName = ? WHERE id = ?',
            [newUserName, userId]
        );

        // Получаем ОБНОВЛЕННЫЕ данные пользователя из базы данных для нового токена
        const [rows] = await pool.query('SELECT id, firstName, lastName, email FROM user WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден после обновления.' });
        }
        const updatedUser = rows[0];

        // Генерируем новый токен с актуальными данными пользователя
        const newToken = jwt.sign({
                userId: updatedUser.id,
                email: updatedUser.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Имя успешно обновлено!',
            token: newToken,
            user: {
                id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email
            }
        });

    } catch (error) {
        console.error('Ошибка при обновлении имени пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера.' });
    }
});

// 8. API-эндпоинт для создания новой темы с загрузкой файла в S3
app.post("/api/new-topic", authMiddleware, upload.single('image'), async (req, res) => {
    const SELECTEL_BUCKET_UUID = '77dae30c-f073-48e8-a2a9-f9c9408ce905';
    const { category, title, description } = req.body;
    const imageFile = req.file; // Multer поместит файл сюда (содержит .buffer)
    const userId = req.user.userId; // ID пользователя из JWT токена

    // Проверка наличия всех обязательных данных
    if (!category || !title || !description || !imageFile) {
        // Если imageFile отсутствует, это может быть из-за отсутствия файла
        // или из-за того, что Multer отклонил его (например, по типу или размеру)
        console.error('Не хватает данных для создания темы или файл изображения отсутствует:', { category, name, description, imageFile: !!imageFile });
        return res.status(400).json({ message: 'Все поля (категория, название, описание) и файл изображения обязательны.' });
    }

    let tableName = '';
    switch(category) {
        case 'NEWS':
          tableName = "news";
          break;
        case 'SPORT':
          tableName = "sports";
          break;
        case 'NATURE':
          tableName = "nature";
          break;
        default:
          throw new Error(`Invalid category: ${category}`);
    }


    let imageUrl = null; // Переменная для хранения URL загруженного изображения    
    try {
        // Генерируем уникальное имя файла для S3
        // Формат: uploads/<timestamp>-originalfilename.ext
        const s3Key = `uploads/${tableName}/${Date.now().toString()}-${imageFile.originalname}`;

        // Создаем объект Upload для загрузки в S3 с использованием AWS SDK v3
        const uploadS3 = new Upload({
            client: s3Client, // Передаем наш инициализированный S3Client
            params: {
                Bucket: process.env.S3_BUCKET_NAME, // Имя вашего S3 бакета
                Key: s3Key, // Сгенерированное уникальное имя файла в S3
                Body: imageFile.buffer, // Содержимое файла (получено из multer.memoryStorage())
                ACL: 'public-read', // Разрешения: файл будет публично доступен для чтения
                ContentType: imageFile.mimetype, // MIME-тип файла (например, 'image/jpeg')
                Metadata: { // Опциональные пользовательские метаданные
                    fieldname: imageFile.fieldname,
                    userId: userId.toString(), // Пример: добавляем ID пользователя как метаданные
                },
            },
            // опционально: для более крупных файлов можно настроить параллельную загрузку
            // queueSize: 4, // Максимальное количество параллельных частей
            // partSize: 1024 * 1024 * 5, // Размер каждой части (5 МБ)
        });

        // Слушаем события прогресса загрузки (опционально)
         uploadS3.on('httpUploadProgress', (progress) => {
             console.log(`Прогресс загрузки: ${Math.round(progress.loaded / progress.total * 100)}%`);
         });

        // Выполняем загрузку файла в S3
        const data = await uploadS3.done();
        /* imageUrl = data.Location; */ // URL загруженного файла (возвращается S3 после успешной загрузки)
        imageUrl = `https://${SELECTEL_BUCKET_UUID}.selstorage.ru/${s3Key}`;

        // Сохраняем информацию о новой теме, включая URL изображения, в базу данных
        const [result] = await pool.execute(
            `INSERT INTO content (category, title, description, image_url, user_id) VALUES (?, ?, ?, ?, ?)`,
            [category, title, description, imageUrl, userId]
        );

        // Отправляем успешный ответ клиенту
        res.status(201).json({
            message: 'Тема успешно создана и сохранена в БД!',
            id: result.insertId,
            imageUrl: imageUrl
        });

    } catch (error) {
        // Обработка ошибок при загрузке в S3 или сохранении в БД
        console.error('Ошибка при создании темы или загрузке изображения в S3:', error);
        res.status(500).json({ message: 'Ошибка сервера при создании темы или загрузке изображения.' });
    }
});

// 8. API-эндпоинт для получения списка самый последних новостей спорта
app.get('/api/latest-sport-news', async (req,res) => {
    try {
        const [rows, metaData] = await pool.execute(
            `SELECT * FROM content WHERE category = 'SPORT' ORDER BY uploaded_at DESC LIMIT 3`
        )

        return  res.status(200).json(rows);
    
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Ошибка сервера при получении новостей.' });
    }
});

//9 API-эндпоинт для получения списка myTopics
app.get('/api/my-topics', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await pool.execute(
      `
      (SELECT id, category, title, description, uploaded_at FROM content WHERE user_id = ?)
      ORDER BY uploaded_at DESC;
      `,
      [userId]
    );

    return res.json(rows);

    } catch (e) {   
        console.error(`Ошибка при получении данных для пользователя ${userId}:`, e);
        res.status(500).json({ message: 'Ошибка сервера при получении данных.' });
    }
});

//10 API-эндпоинт для удаления темы --- не понятна тема
app.delete('/api/my-topic/:id', authMiddleware, async (req, res) => {
    // Получаем ID пользователя из authMiddleware
    const userId = req.user.userId;
    // Получаем ID темы из параметров маршрута
    const topicId = req.params.id; // Correctly get ID from route parameters

    if (!topicId) {
        return res.status(400).json({ message: 'ID темы не указан.' });
    }

    let connection; // Declare connection outside try-catch for proper release

    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        await connection.beginTransaction(); // Start a transaction for atomicity

        const [rows] = await connection.execute( 
            'SELECT id, image_url FROM content WHERE id = ? AND user_id = ?',
            [topicId, userId]
        );

        const topic = rows[0]; // If found, this will be the first (and only) result

        if (!topic) {
            await connection.rollback(); // Rollback if topic not found
            return res.status(404).json({ message: 'Тема не найдена или у вас нет прав на ее удаление.' });
        }

        if (topic.image_url) {
            const urlParts = topic.image_url.split('/');

            const s3Key = topic.image_url.substring(
                (process.env.S3_ENDPINT + '/' + process.env.S3_BUCKET_NAME + '/').length
            );

            const deleteParams = {
                Bucket: process.env.S3_BUCKET_NAME, // Use your S3 bucket name from .env
                Key: s3Key // The extracted S3 key
            };

            try {
                // Use s3Client (AWS SDK v3) for deletion
                await s3Client.send(new DeleteObjectCommand(deleteParams));
                console.log(`S3 object ${s3Key} successfully deleted.`);
            } catch (s3Error) {
                // Important: If S3 deletion fails, it should not block DB deletion
                // but should be logged and potentially alert an administrator.
                console.error(`Error deleting S3 object ${s3Key}:`, s3Error);
                // We don't rollback here, as DB deletion should proceed.
            }
        }

        // 3. Delete the topic from the database using plain SQL
        await connection.execute( // Use connection.execute within a transaction
            'DELETE FROM content WHERE id = ? AND user_id = ?',
            [topicId, userId]
        );

        await connection.commit(); // Commit the transaction if all operations are successful

        // 4. Send a successful response to the client
        res.status(200).json({ message: 'Тема успешно удалена.' });

    } catch (error) {

        if (connection) {
            await connection.rollback(); // Rollback the transaction on any error
        }
        // Handle database errors or other unexpected errors
        console.error('Error deleting topic:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере при удалении темы.', error: error.message });

    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
});

//11 API-эндпоинт для получение Nature тем
app.get('/api/nature', async (req,res) => {

   try {
    const [rows] = await pool.execute(
        `
        SELECT id, category, title, description, uploaded_at
        FROM content
        WHERE category = 'NATURE'
        ORDER BY uploaded_at DESC;
        `
    );

        return res.json(rows); 

    } catch (e) {
        console.error(`Ошибка при получении данных для пользователя`, e);
        res.status(500).json({ message: 'Ошибка сервера при получении данных.' });
    }
});

//12 API-эндпоинт для получение одной  ТЕМЫ News
app.get('/api/nature/:id', async (req, res) => {
    const natureId = parseInt(req.params.id); // Преобразуем строковый ID из URL в число

    if (isNaN(natureId)) {
        return res.status(400).json({ message: 'Неверный формат ID новости.' });
    }

    try {
        const [rows] = await pool.execute(
            `
            SELECT id, category, title, description,image_url, uploaded_at
            FROM content
            WHERE id = ? AND category = 'NATURE';
            `,
            [natureId]
        );

        const newsItem = rows[0];
        if (newsItem) {
            return res.json(newsItem);
        } else {
            return res.status(404).json({ message: `Новость с ID ${natureId} в категории NEWS не найдена.` });
        }

    } catch (e) {
        // Ошибка здесь: вместо 'id' используйте 'newsId'
        console.error(`Ошибка при получении данных для новости с ID ${natureId}:`, e); // <--- ИСПРАВЛЕНО ЗДЕСЬ
        res.status(500).json({ message: 'Ошибка сервера при получении данных.' });
    }
});

//13 API-эндпоинт для получение Sports тем
app.get('/api/sport', async (req,res) => {
   try {
        const [rows] = await pool.execute(
            `
            SELECT id, category, title, description, uploaded_at
            FROM content
            WHERE category = 'SPORT'
            ORDER BY uploaded_at DESC;
            `
    );

    return res.json(rows); 

    } catch (e) {
        console.error(`Ошибка при получении данных для пользователя`, e);
        res.status(500).json({ message: 'Ошибка сервера при получении данных.' });
    }
});

//14 API-эндпоинт для получение одной ТЕМЫ SPROT
app.get('/api/sport/:id', async (req, res) => {
    const sportId = parseInt(req.params.id); // Преобразуем строковый ID из URL в число

    if (isNaN(sportId)) {
        return res.status(400).json({ message: 'Неверный формат ID новости.' });
    }

    try {
        const [rows] = await pool.execute(
            `
            SELECT id, category, title, description,image_url, uploaded_at
            FROM content
            WHERE id = ? AND category = 'SPORT';
            `,
            [sportId]
        );

        const newsItem = rows[0];
        if (newsItem) {
            return res.json(newsItem);
        } else {
            return res.status(404).json({ message: `Новость с ID ${sportId} в категории NEWS не найдена.` });
        }

    } catch (e) {
        // Ошибка здесь: вместо 'id' используйте 'newsId'
        console.error(`Ошибка при получении данных для новости с ID ${sportId}:`, e); // <--- ИСПРАВЛЕНО ЗДЕСЬ
        res.status(500).json({ message: 'Ошибка сервера при получении данных.' });
    }
});

//15 API-эндпоинт для получение News тем
app.get('/api/news', async (req,res) => {
   try {
        const [rows] = await pool.execute(
            `
            SELECT id, category, title, description, uploaded_at
            FROM content
            WHERE category = 'NEWS'
            ORDER BY uploaded_at DESC;
            `
        );
    return res.json(rows); 

    } catch (e) {
        console.error(`Ошибка при получении данных для пользователя`, e);
        res.status(500).json({ message: 'Ошибка сервера при получении данных.' });
    }
});

//16 API-эндпоинт для получение одной News
app.get('/api/news/:id', async (req, res) => {
    const newsId = parseInt(req.params.id); // Преобразуем строковый ID из URL в число

    if (isNaN(newsId)) {
        return res.status(400).json({ message: 'Неверный формат ID новости.' });
    }

    try {
        const [rows] = await pool.execute(
            `
            SELECT id, category, title, description,image_url, uploaded_at
            FROM content
            WHERE id = ? AND category = 'NEWS';
            `,
            [newsId]
        );

        const newsItem = rows[0];
        if (newsItem) {
            return res.json(newsItem);
        } else {
            return res.status(404).json({ message: `Новость с ID ${newsId} в категории NEWS не найдена.` });
        }

    } catch (e) {
        // Ошибка здесь: вместо 'id' используйте 'newsId'
        console.error(`Ошибка при получении данных для новости с ID ${newsId}:`, e); // <--- ИСПРАВЛЕНО ЗДЕСЬ
        res.status(500).json({ message: 'Ошибка сервера при получении данных.' });
    }
});


// --- Запуск сервера ---
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});




