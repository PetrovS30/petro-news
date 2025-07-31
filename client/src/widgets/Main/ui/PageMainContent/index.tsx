import styles from './PageMainContent.module.scss';
import { useEffect, useState } from 'react';

import API_BASE_URL from '../../../../config/api';

const PageMainContent = () => {
    const [lionTitle,setLionTitle] = useState('');
    const [descrLion,setDescrLion] = useState('');
    const [img,setImg] = useState('');


    useEffect(() => {
        const titleAnimalLocalStorage = localStorage.getItem('title-animal');
        const descrAnimalLocalStorage = localStorage.getItem('descr_animal');
        const imageAnimalLocalStorage = localStorage.getItem('image_animal');
            if(titleAnimalLocalStorage && descrAnimalLocalStorage && imageAnimalLocalStorage) {
                setLionTitle(titleAnimalLocalStorage);
                setDescrLion(descrAnimalLocalStorage);
                setImg(imageAnimalLocalStorage);
                return;
            }

            const getAnimalsData = async () => {
                console.log('не будет работа!');
                try {
                    const response = await fetch(`${API_BASE_URL}api/animals`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    // Парсим ответ как JSON => обычный объект
                    const data = await response.json();

                    setLionTitle(data[0].title);
                    setDescrLion(data[0].description);
                    localStorage.setItem("title-animal", data[0].title);
                    localStorage.setItem("descr_animal", data[0].description);
                    
                    try {
                    // 1. Проверяем, есть ли изображение в localStorage
                        const cachedImage = localStorage.getItem('image_animal');
                        if (cachedImage) {
                            setImg(cachedImage);
                        } else {
                            const response = await fetch(`${API_BASE_URL}api/animals`);
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            
                            const data = await response.json();

                            const imageUrl = data[0].image_path;
                            const imageResponse = await fetch(imageUrl);
                            if (!imageResponse.ok) {
                                throw new Error(`Failed to fetch image from S3`);
                            }
                            
                            // 3. Преобразуем в Base64
                            const blob = await imageResponse.blob();
                            const reader = new FileReader();
                            
                            reader.onloadend = () => {
                                const base64Image = reader.result;
                                    if (typeof base64Image === 'string') {
                                        localStorage.setItem('image_animal', base64Image);
                                        setImg(base64Image);
                                    } else {
                                        console.error('Failed to read image as string (Base64). Result:', base64Image);
                                    }
                                };
                            reader.readAsDataURL(blob);
                        }
                    } catch(error) {
                        console.log('Error', error);
                    }
                } catch(error) {
                    console.log('Error', error);
                }
            }
            getAnimalsData();
    }, []);

    return (
        <div className={styles['page-main-content']}>
            <figure className={styles['gallery-item']}>
                <img src={img || "/placeholder.jpg"} alt="The lion" />
                <figcaption>
                    <h3>{lionTitle}</h3>
                </figcaption>
            </figure>
            <p>{descrLion} </p>
        </div>
    )
}

export default PageMainContent;


