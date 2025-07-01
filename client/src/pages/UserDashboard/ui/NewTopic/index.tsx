import { useState } from 'react';
import Cookies from 'js-cookie';
import './newTopic.scss';


const NewTopic = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const [nameTop, setNameTop] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [postText,setPostText] = useState('')


    // Состояния для UI/обратной связи
    const [loading, setLoading] = useState(false); // Индикатор загрузки
    const [message, setMessage] = useState('');   // Сообщение для пользователя (успех/ошибка)
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>(''); // Тип сообщения


  const handleChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };


      // Обработка выбора файла
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    // Создаем превью для отображения
    const reader = new FileReader();
    reader.readAsDataURL(file);
  };


    // Обработчик отправки формы
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = Cookies.get('authToken');
        // 1. Простая валидация перед отправкой
        if (!selectedOption || !nameTop || !postText || !image) {
            setMessage('Пожалуйста, заполните все поля и выберите файл.');
            setMessageType('error');
            return;
        }

        setLoading(true); 
        setMessage('');   
        setMessageType('');

        // 2. Создание объекта FormData
        const formData = new FormData();
        formData.append('category', selectedOption); // 'category' - это ключ, который ваш бэкенд будет ожидать
        formData.append('name', nameTop);             // 'name' - ключ для названия темы
        formData.append('description', postText);     // 'description' - ключ для описания поста
        formData.append('image', image);              // 'image' - ключ для файла изображения

        try {
            // 3. Отправка данных на сервер с использованием fetch API
            // Убедитесь, что ваш бэкенд настроен на прием POST-запросов по этому URL.
            const response = await fetch('http://localhost:3000/api/new-topic', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData, // FormData автоматически устанавливает правильный Content-Type: multipart/form-data
            });

            // 4. Обработка ответа от сервера
            if (response.ok) { // Проверяем статус HTTP-ответа (200-299)
                const data = await response.json(); // Если бэкенд возвращает JSON (например, ID новой записи)
                setMessage(`Тема "${nameTop}" успешно создана! ID: ${data.id || 'N/A'}`);
                setMessageType('success');

                // Очистка формы после успешной отправки
                setSelectedOption('');
                setNameTop('');
                setImage(null);
                setPostText('');
                // Можно сбросить input type="file" вручную, если нужно
                (document.getElementById('fileUpload') as HTMLInputElement).value = '';
            } else {
                // Если статус ответа не OK (например, 400, 500)
                const errorData = await response.json(); // Пытаемся получить детали ошибки из ответа
                setMessage(`Ошибка при создании темы: ${errorData.message || response.statusText}`);
                setMessageType('error');
            }
        } catch (error) {
            // Ошибка сети или другая непредвиденная ошибка
            console.error('Ошибка при отправке данных:', error);
            setMessage('Произошла ошибка при соединении с сервером. Пожалуйста, попробуйте еще раз.');
            setMessageType('error');
        } finally {
            setLoading(false); // Снимаем состояние загрузки в любом случае
        }
    };



    return (
        <div className='new-topic'>
            <h2>Создание новой темы</h2>
            <div className='new-topic__form'>
                <form onSubmit={handleSubmit} action="">
                    <label htmlFor="category-select">Ваша категория</label><br />
                    <select className='new-topic__form-category' 
                            name="Выбирите категорию" 
                            id="category-select" 
                            value={selectedOption} 
                            onChange={handleChange}>
                                <option value="">Выбирите категорию</option>
                                <option value="SPORT">SPORT</option>
                                <option value="NEWS">NEWS</option>
                                <option value="NATURE">NATURE</option>
                    </select>

                    <div className='new-topic__form-name'>
                        <label htmlFor="thome"></label>
                        <input id='thome'type='text' onChange={(e) => setNameTop(e.target.value)}  placeholder='Введите название темы'/>
                    </div>

                    <div className='new-topic__form-download'>
                        <label htmlFor="fileUpload"></label>
                        <input id='fileUpload' onChange={handleImageChange} type="file" name='fileUpload' accept=".jpg,.png"/>
                    </div>

                    <div className='new-topic__form-descr'>
                        <label htmlFor="postText">Описание поста:</label><br />
                        <textarea
                            id="postText"
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="Напишите что-нибудь..."
                            rows={5} 
                            cols={50}/>
                    </div>
                    <div>
                        <button type='submit' className='new-topic__form-btn'>Создать</button>
                    </div>
                </form>

            </div>
        </div>
    )
}

export default NewTopic;