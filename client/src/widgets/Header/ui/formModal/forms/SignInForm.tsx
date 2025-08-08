import './register.scss';
import CloseBtn from '../ui/CloseFormBtn/CloseFormBtn';
import {UserLogo, PassLogo} from '../ui/LogoIcon/LogoIcon';
import { useState } from 'react';

import Cookies from 'js-cookie';
import { useDispatch} from 'react-redux';

import API_BASE_URL from '../../../../../config/api';

import { setCurrentUser, setSignIn } from '../../../../../store/slice/authSlice';



interface SignInFormProps {
    formClose: (value: boolean) => void; 
    formSignActive: (value: boolean) => void; 
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}


const SignInForm = (props : SignInFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch()


   const handleLoginSuccess = (user: User) => {

        const isSecure = window.location.protocol === 'https:';

/*         Cookies.set('isSignIn', "true", { 
            expires: 7, 
            secure: isSecure, 
            sameSite: 'Lax'
        }); */
/*         Cookies.set('user', JSON.stringify(user), {
            expires: 7, 
            secure: isSecure, 
            sameSite: 'Lax'
        }); */

        localStorage.setItem("isSignIn", JSON.stringify(true)); // Сохраняем true как строку

        // Отправляем данные в Redux
        dispatch(setSignIn(true));
        dispatch(setCurrentUser(user));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const loginData = { email, password };

        try {
            const res = await fetch(`${API_BASE_URL}api/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(loginData), 
                credentials: 'include'
            });

            if (res.ok) { 
                const data = await res.json();
                console.log('Login successful:', data);

                // Проверяем, установлен ли токен
                const token = Cookies.get('authToken');
                console.log(data.user);
                
                localStorage.setItem("user", JSON.stringify(data.user));

                if (token) {
                    console.log('Токен найден:', token);
                } else {
                    console.log('Токен не найден. Пользователь не авторизован.');
                }

                if (data.user && token) {
                    // Используем новую, централизованную функцию для обработки успеха
                    handleLoginSuccess(data.user);
                }

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