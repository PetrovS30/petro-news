import './register.scss';
import CloseBtn from '../ui/CloseFormBtn/CloseFormBtn';
import {UserLogo, PassLogo} from '../ui/LogoIcon/LogoIcon';
import { useState } from 'react';

import Cookies from 'js-cookie';
import { useDispatch} from 'react-redux';


import { setCurrentUser, setSignIn } from '../../../../../store/slice/authSlice';


// --- Определение интерфейса для пропсов ---
interface SignInFormProps {
    formClose: (value: boolean) => void; 
    formSignActive: (value: boolean) => void; 
    onLoginSuccess: (userData: { id: number; firstName: string; lastName: string; email: string }, token?: string) => void;
    handleSignInSuccess:(value: boolean) => void;
}


const SignInForm = (props : SignInFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch()


    //  Обработчик отправки формы 
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

    const handleLoginSuccess = (userData: { id: number; firstName: string; lastName: string; email: string }) => {
        dispatch(setSignIn(true));
        dispatch(setCurrentUser(userData));
        if(userData) {
            Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        }
    };


    
    const handleSignInSuccess = () => {
        dispatch(setSignIn(true));
    }

        const loginData = {
            email,
            password,
        };

        try {
            const res = await fetch("http://localhost:3000/api/login", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(loginData), // Преобразуем объект в JSON-строку
            });

            if (res.ok) { 
                const data = await res.json(); // Парсим ответ как JSON
                console.log('Login successful:', data);
                handleSignInSuccess();
                if (data.user && data.token) {
                    handleLoginSuccess(data.user);
                    console.log(data.user);
                    
                }

                // Закрываем форму
                props.formClose(false);
                function setCookie(name: string, value: string, days?: number): void {
                    let expires = "";
                    if (days) {
                        const date = new Date();
                        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                        expires = "; expires=" + date.toUTCString();
                    }

                    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; secure; SameSite=Strict";
                }


                if (data.token) {
                    setCookie('authToken', data.token, 7); 
                    setCookie('isSignIn', "true", 7); 
                    console.log('JWT токен сохранен в куки (вручную):', data.token);
                }

                // Очищаем поля формы после успешного входа
                setEmail('');
                setPassword('');
                props.formClose(false); 
                } else {
                    const contentType = res.headers.get("content-type");

                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await res.json();
                        setError(errorData.message || 'Что-то пошло не так при входе.');
                        console.error('Login failed:', errorData.message);
                    } else {
                        const errorMessage = await res.text(); 
                        setError('Получен неожиданный ответ от сервера. Пожалуйста, попробуйте еще раз.');
                        console.error('Login failed (non-JSON response):', res.status, errorMessage);
                    }
                }
        } catch (err) {
            console.error('Сетевая ошибка при входе:', err);
            setError('Не удалось подключиться к серверу. Пожалуйста, проверьте подключение или попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    return (
             <div className='modal-contant-pages reg-page first-form'>
                <div onClick={() => props.formClose(false)} className='modal-contant-pages-closebtn'>
                    <CloseBtn />
                </div>
                <form className='reg-page-form' onSubmit={handleSubmit}>
                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                    <div className='input'>
                        <div className='reg-page-form-user-logo'>
                            <UserLogo />
                        </div>
                        <input
                            type="email"
                            placeholder='E-mail'
                            autoComplete="username"
                            id="signInEmail"
                            name="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required // Делаем поле обязательным
                        />
                    </div>
                    <div className='input'>
                        <div className='reg-page-form-pass-logo'>
                            <PassLogo />
                        </div>
                        <input
                            type="password"
                            placeholder='Password'
                            autoComplete="current-password"
                            id="signInPassword"
                            name="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <div className='reg-page-form-sign-in'>
                        <button
                            className='reg-page-form-sign-in-btn'
                            type="submit" 
                            disabled={loading} 
                        >
                            {loading ? 'Вход...' : 'Sign in'}
                        </button>
                        <span>
                            <a href="#">Forgot password?</a> 
                        </span>
                    </div>
                </form>
                <div className='modal-contant-pages-signup'>
                    <button type="button" onClick={() => props.formSignActive(true)}>Sign up</button>
                </div>
            </div>
    )
}

export default SignInForm;