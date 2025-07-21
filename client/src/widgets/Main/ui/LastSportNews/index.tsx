import { useEffect, useState } from 'react';
import styles from './LastSportNews.module.scss';
import { Link } from 'react-router-dom';


interface TitleId {
    title: string
    id: string
}

const LatestSportNews = () => {
    const [title,setTitle] = useState<TitleId[]>([]);

    useEffect (() => {
        const getLastSportNews = async () => {
            try{
                const response = await fetch('http://localhost:3000/api/latest-sport-news');
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setTitle(data)
                
            }catch(e) {
                console.log(e);
            }   
        }
        getLastSportNews();
    }, [] );

    return (
         <div className={styles['sidebar__latest-sport-news']}>
            <h2>The latest sports news</h2>
            <ul>
                {
                    title.map((data, i) => {
                        return (
                            <li key={i}><Link to={`/sport/${data.id}`}>{data.title}</Link></li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default LatestSportNews;