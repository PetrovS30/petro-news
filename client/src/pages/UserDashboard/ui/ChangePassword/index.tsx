import './changePassword.scss';

import {useState } from 'react';
import Cookies from 'js-cookie';

const ChangePassword = () => {
    const [currentPassword,setCurrentPassword] =  useState('');
    const [newPassword,setNewPassword] =  useState('');
    const [confirmNewPassword, setConfirmNewPassword] =  useState('');

    const handleSubmit = async(e: React.FormEvent) => {
        const token = Cookies.get("authToken");

        e.preventDefault();

         if (newPassword.length < 3) {
            alert('Пароль должен содержать минимум 6 символов');
            return;
        }

        if(newPassword !== confirmNewPassword) {
            alert('Пароль не совпадают');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/user/change-password', {
                method: 'PUT', // или 'PATCH', если сервер ожидает его
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
                
            });

            if(response.ok) {
                const data = await response.json(); // Парсим ответ как JSON
                if(data.token) {
                    Cookies.remove('authToken');
                    Cookies.set('authToken',data.token, {expires: 1});
                }
            }

                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                return;
                
            } catch (error) {
                console.error('Ошибка:', error);
        }
    }

    return (
        <div className='change-password'>
            <h2>Изменение пароля</h2>
            <div className='change-password__form'>
                <form onSubmit={handleSubmit}>
                    <div>
                        <input 
                            className='change-password__form-hidden-input'
                            type="text" 
                            autoComplete="username" 
                            aria-hidden="true"
                            name="user-name" 
                            id="user-name" />
                    </div>

                     <div>
                        <label htmlFor="User_currentPassword">Текущий пароль</label>
                        <input
                            className='change-password__form-input' 
                            onChange={(e) =>setCurrentPassword(e.target.value)}
                            id='User_currentPassword'
                            type="password" 
                            autoComplete="current-password" 
                            name="User_currentPassword" 
                            value={currentPassword}/>
                    </div>

                     <div>
                        <label htmlFor="User_password">Новый пароль</label>
                        <input
                            className='change-password__form-input' 
                            onChange={(e) =>setNewPassword(e.target.value)}
                            id='User_password'
                            type="password" 
                            autoComplete="new-password" 
                            name="User_password"
                            value={newPassword} />
                    </div>
                    <div>
                        <label htmlFor="User_passwordConfirm">Подтверждение нового пароля</label>
                        <input
                            className='change-password__form-input' 
                            onChange={(e) =>setConfirmNewPassword(e.target.value)}
                            id='User_passwordConfirm'
                            type="password" 
                            autoComplete="confirm-password" 
                            name="User_passwordConfirm" 
                            value={confirmNewPassword}/>
                    </div>

                    <div>
                        <button type='submit' className='change-password__form-button'>Изменить пароль</button>
                    </div> 
                </form>
                <p>*Ваш пароль будет сохранён в зашифрованном виде.</p>
            </div>
        </div>
    )
}

export default ChangePassword;