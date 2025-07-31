import { useState,useEffect } from 'react';
import './personalInfo.scss';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import type{ RootState } from '../../../../store/store';
import { setCurrentUser } from '../../../../store/slice/authSlice';
import { useDispatch } from 'react-redux';
import API_BASE_URL from '../../../../config/api';


const PersonalInfo = () => {
    const {isCurrentUser} = useSelector((state:RootState) => state.authReducer);
    const firstName = isCurrentUser?.firstName; 
    const email = isCurrentUser?.email; 

    const dispatch = useDispatch() ;
    const [newUserName , setNewUserName] = useState(firstName);

    const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUserName(e.target.value)
    }

    useEffect(() => {
        setNewUserName(isCurrentUser?.firstName || '');
    }, [isCurrentUser?.firstName]);

    const submitNewName =  async (e: React.FormEvent) => {
        
        e.preventDefault();
        const token = Cookies.get('authToken');

        if (!token) {
            console.error('Ошибка: Токен авторизации отсутствует.');
            return;
        }


        try {
            const response = await fetch(`${API_BASE_URL}api/user/update-name`, {
                method: 'PUT', // или 'PATCH', если сервер ожидает его
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    newUserName
                })
                
            });

            if(response.ok) {
                const data = await response.json(); // Парсим ответ как JSON
                console.log(data.message);
                console.log(data);
                
                if (data.token && data.user) {
                    Cookies.remove('authToken');
                    Cookies.set('authToken', data.token, { expires: 1 }); 

                    dispatch(setCurrentUser(data.user));
                    setNewUserName(data.user.firstName);
                }
            } else {
                const errorData = await response.json();
                console.error('Ошибка при обновлении имени:', errorData.error || response.statusText);
            }

        } catch (error) {
            console.error('Ошибка:', error);
        }
    }
    
    return(
        <div className='personal-info'>
            <h2>Личные данные</h2>
            <div className='personal-info__form'>
                <form onSubmit={submitNewName}>
                    <div>
                        <label htmlFor="email">Электронная почта (email)</label><br />
                        <input title='Нельзя изменить' disabled autoComplete='email' type="text" id='email' name='email' placeholder={email}/>
                    </div>
                    <div>
                        <label htmlFor="name">Ваше имя в системе</label><br />
                        <input onChange={handleNameInputChange}  autoComplete='name' type="text" id='name' name='name' defaultValue={firstName}/>
                    </div>
                    <div>
                        <button type='submit'  className='personal-info__form-btn'>Сохранить изменения</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PersonalInfo;