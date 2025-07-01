const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
const port = 3000;

// --- Начало настроек Middleware ---

// 1. CORS Middleware: Разрешает запросы с других доменов.
// ЭТО ДОЛЖЕН БЫТЬ ЕДИНСТВЕННЫЙ ВЫЗОВ cors()
app.use(cors({
    origin: 'http://localhost:5173' // Разрешить запросы только с вашего фронтенда
}));

// 2. Body Parsers (для JSON и URL-encoded данных).
// ЭТО ДОЛЖЕН БЫТЬ ЕДИНСТВЕННЫЙ ВЫЗОВ express.json() И express.urlencoded()
// Эти парсеры нужны для маршрутов, которые принимают JSON/URL-encoded данные (signup, login, change-password, update-name).
// Multer будет обрабатывать multipart/form-data для файловых загрузок.
app.use(express.json({ limit: '50mb' })); // Увеличиваем лимит для JSON
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Увеличиваем лимит для URL-encoded

// 3. Настройка Multer для обработки загрузки файлов.
// Multer не используется как app.use() глобально, а применяется ТОЛЬКО к конкретному маршруту POST,
// который принимает файлы.
const storage = multer.memoryStorage(); // Файл будет доступен в req.file.buffer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // Лимит размера файла до 50 МБ
    }
});


//  Middleware JWT token от client to server
const authMiddleware = (req, res, next) => {
  console.log("Полученные заголовки:", req.headers); // Проверьте наличие Authorization
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("Заголовок Authorization отсутствует");
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  const token = authHeader.split(' ')[1];
  console.log("Извлечённый токен:", token); // Проверьте, что токен извлекся
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Декодированный токен:", decoded); // Проверьте содержимое
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Ошибка верификации:", err);
    return res.status(401).json({ error: "Неверный токен" });
  }
};

// 2. Middleware для Express
// Включаем CORS для разрешения запросов с других доменов (например, с вашего фронтенда)
app.use(cors());//можно подробнее настроить
// Включаем парсер JSON для обработки данных, отправленных в теле запроса (req.body)
app.use(express.json());//use middleware

// 3. Конфигурация подключения к базе данных MySQL (использование Connection Pool)/ const connection = mysql.createConnection(dbConfig);
// Connection Pool более эффективен и надежен для серверных приложений
const pool = mysql.createPool({
    host: 'localhost',    // Адрес вашего MySQL сервера
    user: 'root',         // Ваше имя пользователя MySQL
    password: '',         // Ваш пароль MySQL (если его нет, оставьте пустым)
    database: 'testbd',   // Имя вашей базы данных
    waitForConnections: true, // Будет ли пул ждать, пока станет доступно соединение, если все заняты
    connectionLimit: 10,      // Максимальное количество одновременно открытых соединений
    queueLimit: 0             // Максимальное количество запросов, которые могут стоять в очереди
});

// 4. Проверка подключения к базе данных (опционально, но полезно для отладки)
pool.getConnection()
    .then(connection => {
        console.log('Подключено к базе данных MySQL через пул!');
        connection.release(); // Освобождаем соединение обратно в пул
    })
    .catch(err => {
        console.error('Ошибка получения подключения из пула:', err.stack);
        // В реальном приложении здесь можно предпринять действия,
        // например, завершить процесс, если нет подключения к БД
    });

// 5. API-эндпоинт для получения данных users(пример)
app.get('/api/data', async (req, res) => {
    try {
        // execute() возвращает массив, где первый элемент - это строки, второй - метаданные полей
        const [rows, fields] = await pool.execute('SELECT * FROM user'); // Убедитесь, что имя таблицы 'user'
        res.json(rows); // Отправляем только строки (данные)
    } catch (error) {
        console.error('Ошибка выполнения запроса /api/data:', error);
        res.status(500).json({ error: 'Ошибка сервера при получении данных.' });
    }
});

// 6. API-эндпоинт для получения данных animals(пример)
app.get('/api/animals', async (req, res) => {
    try {
        // execute() возвращает массив from Database, где первый элемент - это строки, второй - метаданные полей
        const [rows, fieldsMetaData] = await pool.execute('SELECT * FROM animals'); // Убедитесь, что имя таблицы 'animals'
        res.json(rows); // Отправляем только строки (данные)
    } catch (error) {
        console.error('Ошибка выполнения запроса /api/animals:', error);
        res.status(500).json({ error: 'Ошибка сервера при получении данных.' });
    }
});




// 7. API-эндпоинт для регистрации пользователя (SignUp Route)
app.post('/api/signup', async (req, res) => {
    // Получаем данные из тела запроса (они будут доступны благодаря app.use(express.json()))
    const { firstName, lastName, email, password } = req.body;

    // Базовая валидация данных
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Все поля обязательны для заполнения.' });
    }

    try {
        // 1. Проверка существования пользователя по email
        console.log('Попытка выбора пользователя по email:', email);
        const [existingUsers] = await pool.execute('SELECT id FROM user WHERE email = ?', [email]); // Используем pool.execute
        console.log('Результат SELECT:', existingUsers);

        if (existingUsers.length > 0) {
            // Пользователь с таким email уже существует
            return res.status(409).json({ message: 'Пользователь с таким email уже зарегистрирован.' });
        }

        // 2. Хеширование пароля перед сохранением в базу данных
        // Использование bcrypt для безопасного хранения паролей
        const hashedPassword = await bcrypt.hash(password, 10); // 10 - количество "раундов" хеширования (сложность)

        // 3. Вставка нового пользователя в базу данных
        // Убедитесь, что имя таблицы `user` и имена колонок соответствуют вашей БД
        // 'password_hash' - рекомендованное название для колонки, хранящей хешированный пароль
        console.log('Попытка вставки нового пользователя...');
        const [result] = await pool.execute(
            'INSERT INTO user (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword]
        );
        console.log('Результат INSERT:', result);

        // Отправляем успешный ответ
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован!', userId: result.insertId });

    } catch (error) {
        // Обработка любых ошибок, возникших во время процесса регистрации
        console.error('Ошибка во время регистрации пользователя (полная информация):', error);
        // Отправляем общий 500-й статус ошибки клиенту.
        // Избегайте отправки деталей ошибки базы данных клиенту в production!
        res.status(500).json({ message: 'Внутренняя ошибка сервера при регистрации.' });
    }
});



// API-эндпоинт для входа пользователя (Login Route)
app.post('/api/login', async (req, res) => {
    // Получаем email и пароль из тела запроса
    const { email, password } = req.body;

    // Базовая валидация
    if (!email || !password) {
        return res.status(400).json({ message: 'Email и пароль обязательны.' });
    }

    try {
        // 1. Находим пользователя в базе данных по email
        // Используем pool.execute, чтобы получить данные пользователя
        const [users] = await pool.execute(
            'SELECT id, firstName, lastName, email, password FROM user WHERE email = ?',
            [email]
        );


        
        // Если пользователь не найден
        if (users.length === 0) {
            // Важно: Не сообщайте, существует ли email или неверный пароль.
            // Всегда давайте общее сообщение для безопасности.
            return res.status(401).json({ message: 'Неверные учетные данные (email или пароль).' });
        }

        const user = users[0]; // Получаем найденного пользователя
        const hashedPassword = user.password; // Получаем хешированный пароль из БД

        // 2. Сравниваем предоставленный пароль с хешированным паролем из базы данных
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordValid) {
            // Пароль не совпадает
            return res.status(401).json({ message: 'Неверные учетные данные (email или пароль).' });
        }

        const token = jwt.sign({
                userId: user.id, 
                email: user.email, 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Токен истекает через 1 час
        );

        res.status(200).json({
            message: 'Вход успешно выполнен!',
            token: token,
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


// Эндпоинт для получения данных текущего пользователя
app.get('/api/me', authMiddleware,  async (req, res) => {
  try {
    // Получаем токен из заголовков
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Токен отсутствует' });
    }

    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Находим пользователя в БД
    const [users] = await pool.execute(
      'SELECT id, firstName, lastName, email FROM user WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Ошибка в /api/me:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


app.put('/api/user/change-password',authMiddleware, async(req,res) => {
    const userId = req.user.userId; // Получаем ID из токена    
    const { currentPassword, newPassword} = req.body;

      // Валидация
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
  }

  try {
    // 1. Получаем текущий пароль из БД
    const [users] = await pool.execute(
      'SELECT password FROM user WHERE id = ?', 
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = users[0];

    // 2. Проверяем совпадение текущего пароля
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // 3. Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Обновляем пароль в БД
    await pool.execute(
      'UPDATE user SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    // 5. Отправляем успешный ответ
            const token = jwt.sign({
                userId: user.id, 
                email: user.email, 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Токен истекает через 1 час
        );

        res.status(200).json({
            message: 'Вход успешно выполнен!',
            token: token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });

  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/user/update-name', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { newUserName} = req.body;
  // Валидация
  if (!newUserName) {
    return res.status(400).json({ error: 'Имя и фамилия обязательны' });
  }

  if (newUserName.length < 2) {
    return res.status(400).json({ error: 'Имя должно состоять минимум из 2 букв' });
  }

  


 try {
    // 1. Обновляем имя в БД
    await pool.execute(
      'UPDATE user SET firstName = ? WHERE id = ?',
      [newUserName, userId]
    );

    // 2. Получаем ОБНОВЛЕННЫЕ данные пользователя из базы данных
      // Это важно, чтобы получить актуальные firstName, email и т.д.
      const [rows] = await pool.query('SELECT id, firstName, lastName, email FROM user WHERE id = ?',
        [userId]
      );

      if (rows.length === 0) {
          // Это маловероятно, если обновление прошло успешно, но хорошо бы иметь
          return res.status(404).json({ error: 'Пользователь не найден после обновления.' });
      }
      const updatedUser = rows[0]; // <<< Теперь у нас есть объект updatedUser

        // 3. Генерируем новый токен с актуальными данными
        const newToken = jwt.sign({
            userId: updatedUser.id,
            email: updatedUser.email,
        },
        process.env.JWT_SECRET,
        // ВНИМАНИЕ: expiresIn: '24h' для 24 часов. '24' - это 24 миллисекунды!
        { expiresIn: '24h' }
        );

        // 4. Отправляем успешный ответ с обновленными данными пользователя и новым токеном
        res.status(200).json({
            message: 'Имя успешно обновлено!', // Более подходящее сообщение
            token: newToken,
            user: { // Отправляем обратно обновленные данные пользователя
                id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email
            }
        });

  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }

});

app.post("/api/new-topic", authMiddleware, upload.single('image'), async (req, res) => {
    // req.file содержит информацию о загруженном файле
    // req.body содержит текстовые поля, отправленные с FormData
    const { category, name, description } = req.body;
    const imageFile = req.file; // Это объект файла, который предоставляет multer (если storage: memoryStorage, то req.file.buffer)

    // Проверка наличия всех необходимых данных
    if (!category || !name || !description || !imageFile) {
        console.error('Не хватает данных для создания темы:', { category, name, description, imageFile: !!imageFile });
        return res.status(400).json({ message: 'Все поля (категория, название, описание) и файл изображения обязательны.' });
    }

    // Пока S3 не настроен, выводим данные в консоль
    console.log('Получены данные для создания темы:');
    console.log('Категория:', category);
    console.log('Название:', name);
    console.log('Описание:', description);
    console.log('Информация о файле:', {
        originalname: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
        // buffer: imageFile.buffer.toString('base64').substring(0, 50) + '...' // первые 50 символов буфера
    });
    console.log('*** Файл получен на бэкенде! ***');
    res.status(200).json({message: 'ok'})
})

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});