import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import trashDelete from './../../../../assets/icons/trash-delete.svg';
import pencilEdit from './../../../../assets/icons/pencil-edit.svg';
import iconArrowPrev from '../../../../assets/icons/icon-arrow-prev.svg'
import iconArrowNext from '../../../../assets/icons/icon-arrow-next.svg';

import './myTopic.scss';

interface Topic {
  id: number; 
  title: string;
}


const MyTopic = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const topicsPerPage = 5;

    const totalPages = Math.ceil(topics.length / topicsPerPage);

    // Вычисляем темы для текущей страницы
    const indexOfLastTopic = currentPage * topicsPerPage;
    const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
    const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);

    // Обработчик для изменения страницы
    const paginate = (pageNumber:number) => setCurrentPage(pageNumber);

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handleDeleteTopic = async (id:number) => {

        const token = Cookies.get('authToken')
        if (window.confirm('Вы уверены, что хотите удалить эту тему?')) {
            setTopics(topics.filter(topic => topic.id !== id));
            // В реальном приложении здесь был бы запрос на бэкенд для удаления темы
        }

        try {
            const response =  await fetch(`http://localhost:3000/api/my-topic/${id}`, {
                method : 'DELETE',
                headers : {
                     'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                }
            });

             if (response.ok) {
                // If the backend deletion was successful, then update the UI
                setTopics(topics.filter(topic => topic.id !== id));
                console.log(`Тема с ID ${id} успешно удалена.`);
            } else {
                // Handle non-OK responses (e.g., 404, 500)
                const errorData = await response.json(); // Try to parse error message from backend
                console.error('Ошибка при удалении темы:', response.status, errorData.message || 'Неизвестная ошибка');
                alert(`Не удалось удалить тему: ${errorData.message || 'Произошла ошибка на сервере.'}`);
            }
        } catch(error) {
            console.error('Ошибка сети при удалении темы:', error);
            alert('Не удалось соединиться с сервером для удаления темы.');
        }
    };

    // Обработчик для редактирования темы (фиктивный)
    const handleEditTopic = (id:number) => {
        alert(`Редактировать тему с ID: ${id}`);
    };

    // Генерация номеров страниц для пагинации
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    useEffect(() =>  {
        const myTopics = async () =>  {
        const token = Cookies.get('authToken');

        if (!token) {
            console.error('Ошибка: Токен авторизации отсутствует.');
            return;
        }

            try{
                const response = await fetch('http://localhost:3000/api/my-topics', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Здесь мы передаем токен
                    },
                });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Ошибка при получении постов');
                    }

                    const myPosts = await response.json();
                    setTopics(myPosts)

            }catch(e){
                console.log(e);
                return null;
            }
        }
        myTopics();
    }, [])

        // --- Логика для усечения текста при изменении размера окна ---
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const breakpoint = 800;
    const maxLength = 20;

    // Функция для усечения текста
    const getDisplayTitle = (title: string) => {
        if (windowWidth <= breakpoint && title.length > maxLength) {
            return title.slice(0, maxLength) + '...'; // Добавляем многоточие
        }
        return title;
    };

    // Эффект для отслеживания изменения размера окна
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Пустой массив зависимостей, чтобы слушатель добавлялся один раз
    // --- Конец логики для усечения текста ---

    return (
        <div className='my-topics__list'>
            <h2>My topics</h2>
            {
                topics.length >= 1 ? 
                    <div className='my-topics__list-form'>
                        <ul>
                            {currentTopics.map(topic => (
                                <li
                                    key={topic.id}
                                    className='my-topics__list-item'>
                                    <a
                                        className='my-topics__list-link'
                                        href="#">
                                        {getDisplayTitle(topic.title)}
                                    </a>
                                    
                                    <button
                                        className='my-topics__list-btn-edit'
                                        onClick={() => handleEditTopic(topic.id)}>

                                        <img title='Нельзя редактировать' src={pencilEdit} alt="edit" />
                                    </button>
                                    <button
                                        className='my-topics__list-btn-trash'
                                        onClick={() => handleDeleteTopic(topic.id)}>
                                            
                                        <img src={trashDelete} alt="trash" />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className='pagination__wrapper'>
                            <span className='agination__arrow-container'>
                                <img className={`pagination__arrow ${currentPage === 1 ? 'pagination__arrow--disabled' : ''}`}
                                    src={iconArrowPrev} 
                                    alt="Previous" 
                                    onClick={goToPrevPage}/>
                            </span>
                            <ul  className='pagination__list'>
                                {pageNumbers.map(number => (
                                    <li
                                        key={number}
                                        className={`pagination__list-item ${number === currentPage ? 'pagination__list-item--active' : ''}`}>
                                        <button
                                            className={`pagination__button ${number === currentPage ? 'pagination__button--active' : ''}`}
                                            onClick={() => paginate(number)}>
                                            {number}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <span className='pagination__arrow-container'>
                                <img  className={`pagination__arrow ${currentPage === totalPages ? 'pagination__arrow--disabled' : ''}`} 
                                    src={iconArrowNext} 
                                    alt="Next" 
                                    onClick={goToNextPage}/>
                            </span>
                        </div>
                    </div> : <span>У вас нет еще тем,создайте тему!</span>
            }
        </div>
    );
};

export default MyTopic;






