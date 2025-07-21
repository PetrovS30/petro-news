import { useState } from 'react';
import Cookies from 'js-cookie';
import './newTopic.scss';

// Определяем тип для категорий, чтобы TypeScript мог проверять значения
type Category = 'SPORT' | 'NEWS' | 'NATURE' | '';
type MessageType = 'success' | 'error' | ''; // Типы для сообщений

const NewTopic = () => {
  const [selectedOption, setSelectedOption] = useState<Category>(''); // Типизация selectedOption
  const [nameTop, setNameTop] = useState<string>(''); 
  const [image, setImage] = useState<File | null>(null); 
  const [postText, setPostText] = useState<string>(''); 

  // Состояния для UI/обратной связи
  const [loading, setLoading] = useState<boolean>(false); 
  const [message, setMessage] = useState<string>('');    
  const [messageType, setMessageType] = useState<MessageType>('');

  // Обработка выбора категории
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value as Category); 
  };

  // Обработка выбора файла
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null); 
      return;
    }
    setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = Cookies.get('authToken');

    // 1. Простая валидация перед отправкой
    if (!selectedOption || !nameTop.trim() || !postText.trim() || !image) {
      setMessage('Пожалуйста, заполните все поля и выберите файл.');
      setMessageType('error');
      return;
    }
    if (!token) {
        setMessage('Необходима авторизация для создания темы.');
        setMessageType('error');
        return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    // 2. Создание объекта FormData
    const formData = new FormData();
    formData.append('category', selectedOption);
    formData.append('title', nameTop.trim());
    formData.append('description', postText.trim());
    if (image) { 
      formData.append('image', image);
    }

    try {
      const response = await fetch('http://localhost:3000/api/new-topic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type не устанавливается вручную для FormData, браузер сделает это сам с 'multipart/form-data'
        },
        body: formData,
      });

      // 4. Обработка ответа от сервера
      if (response.ok) {
        const data = await response.json();
        setMessage(`Тема "${nameTop}" успешно создана! ID: ${data.id || 'N/A'}`);
        setMessageType('success');

        // Очистка формы после успешной отправки
        setSelectedOption('');
        setNameTop('');
        setImage(null);
        setPostText('');
        // Сброс input type="file"
        const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        console.log(data.message);

      } else {
        const errorData = await response.json();
        setMessage(`Ошибка при создании темы: ${errorData.message || response.statusText}`);
        setMessageType('error');
      }
    } catch (error: unknown) { // Типизируем ошибку как unknown
      console.error('Ошибка при отправке данных:', error);
      if (error instanceof Error) {
        setMessage(`Произошла ошибка при соединении с сервером: ${error.message}. Пожалуйста, попробуйте еще раз.`);
      } else {
        setMessage('Произошла неизвестная ошибка при соединении с сервером. Пожалуйста, попробуйте еще раз.');
      }
      setMessageType('error');
    } finally {
      setLoading(false); // Снимаем состояние загрузки в любом случае
    }
  };

  return (
    <div className='new-topic'>
      <h2>Создание новой темы</h2>
      <div className='new-topic__form'>
        <form onSubmit={handleSubmit}>
          <label htmlFor="category-select">Ваша категория</label><br />
          <select
            className='new-topic__form-category'
            name="category" 
            id="category-select"
            value={selectedOption}
            onChange={handleChange}
          >
            <option value="">Выберите категорию</option>
            <option value="SPORT">SPORT</option>
            <option value="NEWS">NEWS</option>
            <option value="NATURE">NATURE</option>
          </select>

          <div className='new-topic__form-name'>
            <label htmlFor="topic-name">Название темы:</label> <br />
            <input
              id='topic-name' // Изменил ID, чтобы не путаться с thome
              value={nameTop}
              type='text'
              onChange={(e) => setNameTop(e.target.value)}
              placeholder='Введите название темы'
            />
          </div>

          <div className='new-topic__form-download'>
            <label htmlFor="fileUpload">Выберите изображение:</label><br /> {/* Явный label */}
            <input
              id='fileUpload'
              onChange={handleImageChange}
              type="file"
              name='image' 
              accept=".jpg,.jpeg,.png" 
            />
          </div>

          <div className='new-topic__form-descr'>
            <label htmlFor="postText">Описание поста:</label><br />
            <textarea
              id="postText"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Напишите что-нибудь..."
              rows={5}
              cols={50}
            />
          </div>

          <div>
            <button type='submit' className='new-topic__form-btn' disabled={loading}>
              {loading ? 'Создаем...' : 'Создать'} 
            </button>
          </div>

          {/* Сообщение для пользователя */}
          {message && (
            <div className={`message ${messageType}`} role="alert" aria-live="polite"> 
              {message}
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default NewTopic;