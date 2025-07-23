import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Хук для получения параметров из URL

import  './singleSportPage.scss';

interface NewsItem {
    id: number;
    title: string;
    description: string;
    uploaded_at: string;
    image_url?: string;
}

const SingleSportPage = () => {
  // useParams позволяет получить параметры из URL.
  const { id } = useParams<{ id: string }>(); 
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchNewsItem = async () => {
      if (!id) {
        setError('ID новости не найден в URL.');
        setLoading(false);
        return;
      }

      setLoading(true); 
      setError(null); 

      try {
        const response = await fetch(`http://localhost:3000/api/sport/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Новость с ID ${id} не найдена.`);
          }
          throw new Error(`Ошибка при загрузке новости: ${response.statusText}`);
        }

        const data: NewsItem = await response.json();

        setNewsItem(data); 
      } catch (e: unknown) {
            // Проверяем, является ли e экземпляром Error
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('Произошла неизвестная ошибка при загрузке новости.');
            }
      } finally {
        setLoading(false); 
      }
    };

    fetchNewsItem();
  }, [id]); 

    if (loading) {
        return <div className="single-item-container">Загрузка новости...</div>;
    }

    if (error) {
        return <div className="single-item-container error">Ошибка: {error}</div>;
    }

    if (!newsItem) {
        return <div className="single-item-container">Новость не найдена.</div>;
    }

  return (
    <div className="single-item-container-sport">
      <h1 className="single-item-title-sport">{newsItem.title}</h1>
      <p className="single-item-date-sport">
        Опубликовано:{' '}
        {new Date(newsItem.uploaded_at).toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
      <div  className='single-item-image-sport'>
        <img src={newsItem.image_url} alt={newsItem.title} />
      </div>
      <div className="single-item-description-sport">
        <p>{newsItem.description}</p>
      </div>

    </div>
  );
};

export default SingleSportPage;

