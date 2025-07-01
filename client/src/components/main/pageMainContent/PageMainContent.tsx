import './pageMainContent.scss';
import { useEffect, useState } from 'react';

const PageMainContent = () => {
    const [lionTitle,setLionTitle] = useState('');
    const [descrLion,setDescrLion] = useState('');
    const [img,setImg] = useState('');
    useEffect(() => {
    const getAnimalsData = async () => {
        try {
        const response = await fetch('http://localhost:3000/api/animals');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Парсим ответ как JSON
                const data = await response.json();

                // Выводим данные в консоль браузера
                console.log('Данные из MySQL:', data);
                setLionTitle(data[0].title)
                setDescrLion(data[0].description);
                setImg(data[0].image_path);

        }catch(error) {
        console.log('Error', error);
        }
    }
    getAnimalsData();
    }, []);

    return (
        <div className='page-main-content'>
            <figure className='gallery-item'>
                <img src={img} alt="The lion" />
                <figcaption>
                    <h3>{lionTitle}</h3>
                </figcaption>
            </figure>
            <p>{descrLion} </p>
        </div>
    )
}

export default PageMainContent;
