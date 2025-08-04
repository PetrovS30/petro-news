import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useTitle from '../../shared/hooks/useTitle';

import iconArrowPrev from '../../assets/icons/icon-arrow-prev.svg';
import iconArrowNext from '../../assets/icons/icon-arrow-next.svg';

import API_BASE_URL from '../../config/api';

import './sports.scss';

interface NewsItem {
    id: number;
    title: string;
    description: string;
    uploaded_at: string;
}

// Вспомогательная функция для форматирования дат для отображения
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return 'Неизвестная дата'; // Заглушка для невалидных дат
    }

    //Явно указываем типы для объекта options
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    return date.toLocaleDateString('ru-RU', options);
};

// Вспомогательная функция для получения только части даты (ГГГГ-ММ-ДД) для сравнения
const getDateKey = (dateString: string): string => {
    if (!dateString || typeof dateString !== 'string') {
        console.warn('getDateKey: Получена недействительная или нестроковая дата:', dateString);
        return 'invalid-date-key';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        console.warn('getDateKey: Невозможно преобразовать строку в валидную дату:', dateString);
        return 'invalid-date-key';
    }

    return date.toISOString().split('T')[0]; // Получаем 'YYYY-MM-DD'
};

const Sport = () => {
    useTitle('Petro-news / sports')
    const [nature, setNature] = useState<NewsItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const topicsPerPage = 10;
    const totalPages = Math.ceil(nature.length / topicsPerPage);

    const indexOfLastTopic = currentPage * topicsPerPage;
    const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
    const currentTopics = nature.slice(indexOfFirstTopic, indexOfLastTopic);

    // Обработчик для изменения страницы
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    useEffect(() => {
        const getNature = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}api/sport`);

                if (!response.ok) {
                    console.error('Ошибка при получении данных:', response.statusText);
                    return;
                }

                const data: NewsItem[] = await response.json();

                const validatedData = data.filter((item: NewsItem) => {

                if (!item.uploaded_at || typeof item.uploaded_at !== 'string') {
                    console.warn('Пропущена новость: отсутствует или неверный тип `uploaded_at`', item);
                    return false;
                }

                const tempDate = new Date(item.uploaded_at);

                if (isNaN(tempDate.getTime())) {
                    console.warn('Пропущена новость: невалидный формат даты в `uploaded_at`', item);
                    return false;
                }
                    return true; 
                });

                setNature(validatedData);
                
            } catch (e) {
                console.error('Произошла ошибка при запросе данных:', e);
            }
        };
        
        getNature();
  }, []);

  return (
    <div className="nature-container">
      <div className="nature-content-wrapper">
        <h1 className="nature-heading">Спорт</h1>
        {currentTopics.length > 0 ? (

          Object.entries(
            currentTopics.reduce((acc, item) => {
              const dateKey = getDateKey(item.uploaded_at);
              if (!acc[dateKey]) {
                acc[dateKey] = [];
              }
              acc[dateKey].push(item);
              return acc;
            }, {} as Record<string, NewsItem[]>)
          )
            .sort(([dateKeyA], [dateKeyB]) => {

              if (dateKeyA === 'invalid-date-key') return 1;
              if (dateKeyB === 'invalid-date-key') return -1;

              return new Date(dateKeyB).getTime() - new Date(dateKeyA).getTime();
            })
            .map(([dateKey, newsItems]) => (
              <div key={dateKey} className="date-group">
                <h2 className="date-heading">
                  {dateKey === 'invalid-date-key'
                    ? 'Дата не указана или неверный формат'
                    : formatDate(dateKey)}
                </h2>

                {newsItems
                  .sort(
                    (a: NewsItem, b: NewsItem) =>
                      new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
                  )
                  .map((newsItem: NewsItem) => (
                    <div key={newsItem.id} className="news-item">
                      <div className="news-time">
                        {newsItem.uploaded_at &&
                        !isNaN(new Date(newsItem.uploaded_at).getTime())
                          ? new Date(newsItem.uploaded_at).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ' --:-- '}
                      </div>
                      <Link to={`/sport/${newsItem.id}`} className="news-title-link">
                            <div className="news-title">{newsItem.title}</div>
                      </Link>
                    </div>
                  ))}
              </div>
            ))
        ) : (
          <p className="no-data-message">Загрузка данных или данных нет.</p>
        )}
      </div>

        <div className="pagination__wrapper">
            <span className="agination__arrow-container">
            <img
                className={`pagination__arrow ${currentPage === 1 ? 'pagination__arrow--disabled' : ''}`}
                src={iconArrowPrev}
                alt="Previous"
                onClick={goToPrevPage}
            />
            </span>
            <ul className="pagination__list">
            {pageNumbers.map((number) => (
                <li
                key={number}
                className={`pagination__list-item ${number === currentPage ? 'pagination__list-item--active' : ''}`}
                >
                <button
                    className={`pagination__button ${number === currentPage ? 'pagination__button--active' : ''}`}
                    onClick={() => paginate(number)}
                >
                    {number}
                </button>
                </li>
            ))}
            </ul>
            <span className="pagination__arrow-container">
            <img
                className={`pagination__arrow ${currentPage === totalPages ? 'pagination__arrow--disabled' : ''}`}
                src={iconArrowNext}
                alt="Next"
                onClick={goToNextPage}
            />
            </span>
        </div>
    </div>
  );
};

export default Sport;