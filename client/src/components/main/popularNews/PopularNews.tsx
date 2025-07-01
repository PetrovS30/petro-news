import './popularNews.scss';
import Krasnodar from './krasnodar 1.png'

const PopularNews = () => {
    return (
        <div className="sidebar__popular"> 
            <h2>Krasnodar Champion RFPL 2024-2025</h2> 
            <img 
                src={Krasnodar} 
                alt="Футбольный клуб Краснодар - чемпионы РФПЛ 2024-2025" 
            />
            <p className="most-important-news-description">
                В мае 2025 года футбольный клуб «Краснодар» совершил то, что еще недавно казалось почти невозможным: стал чемпионом Российской Премьер-лиги, опередив многолетнего гегемона — «Зенит» из Санкт-Петербурга. Это историческое событие стало итогом системной работы клуба, продуманной стратегии и невероятного сезона, полного борьбы, эмоций и решимости.
            </p>
        </div>
    )
}

export default PopularNews;
