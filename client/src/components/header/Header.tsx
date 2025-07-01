import { useState, useEffect, useContext} from 'react';
import Cookies from 'js-cookie';

import FormModal from './formModal/FormModal';
import BurgerIcon from './BurgerMenu';
import CloseMenu from './CloseMenu';
import myContextAuth from '../../context';

import requestAuth from './formModal/ui/useAuth';

import petrologo from '../../assets/images/petro-news-logo.svg';
import './header.scss';



const Header = () => {

  const { 
    isAuthChecked, 
    isSignIn, 
    currentUser,
    setSignIn,
    setCurrentUser,
    setIsAuthChecked
  } = useContext(myContextAuth);

        const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
        const [isBurgerMenuOpened,setIsBurgerMenuOpened] = useState(true);
        const [isShowModalForm, setShowModalForm] = useState(false);

    //проврка на наличие user in cookie
    useEffect(() => {
        const checkAuth = async () => {
        // Проверяем, есть ли сохранённые данные в куках 
            const savedUser = Cookies.get('user');
            
            if (savedUser) {
                setCurrentUser(JSON.parse(savedUser));
            }
        };
        checkAuth();
    }, []);

    
    const handleSignOut = () => {
        setSignIn(false);
        setCurrentUser(null);
        Cookies.remove('user');
        Cookies.remove('authToken');
    }

    const handleLoginSuccess = (userData: { id: number; firstName: string; lastName: string; email: string }) => {
        setSignIn(true);
        setCurrentUser(userData); // Сохраняем данные пользователя
        if(userData) {
            Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        }
    };

     useEffect(() => {
        // Получаем токен из куки с помощью нашей вспомогательной функции
        const storedToken = Cookies.get('authToken');

        if (storedToken) {
            setSignIn(true);
            // --- THIS IS THE PART THAT ASKS YOUR BACKEND SERVER ---
            requestAuth(storedToken)
            .then(response => { // After getting a reply from the server...
                if (!response.ok) { // If the server said "No, that token is bad" (e.g., status 401, 403)
                    console.error('Header: Token invalid or server error:', response.statusText);
                    setSignIn(false); // User is NOT signed in
                    setCurrentUser(null); // No user name
                    throw new Error('Failed to fetch user data'); // Stop processing
                }
                return response.json(); // If the token was good, read the data the server sent back (e.g., the username)
            })
            .then(data => { // Now we have the actual user data (like { username: "John Doe" })
                console.log('Header: User data received:', data);
                setSignIn(true); // User IS signed in!
            })
            .catch(error => { // If anything went wrong (network error, server error, etc.)
                console.error('Header: Error during user data request:', error);
                setSignIn(false); // User is NOT signed in
                setCurrentUser(null); // No user name
            })
            .finally(() => { // Always run this, whether successful or failed
                setIsAuthChecked(true); // We've finished checking login status
            });
        } else {
            console.log('Header: Токен не найден в куки. Пользователь не авторизован.');
            setSignIn(false);
            setCurrentUser(null);
        }
        setIsAuthChecked(true); 
    }, []);



    const mobileBreakpoint = 768;
    
    const showNavMenu = () =>  {
        setIsNavMenuOpen(isNavMenuOpen => !isNavMenuOpen);
        setIsBurgerMenuOpened(!isBurgerMenuOpened);
    } 

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > mobileBreakpoint && isNavMenuOpen) {
                setIsNavMenuOpen(false);
                setIsBurgerMenuOpened(true);
            }
        };
        window.addEventListener('resize', handleResize);

        // Функция очистки: удаляем слушатель события при размонтировании компонента
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isNavMenuOpen, mobileBreakpoint]); 


    const closeFormModal = () => {
        setShowModalForm(false);
    }

    const toggleFormMode = () => {
        setShowModalForm(!isShowModalForm);//prev?
    }

    const handleSignInSuccess = () => {
        setSignIn(true);
    }

    return(
        <header className='header'>
            <div className='header-content'>
                <div className='header-content__logo'>
                    <img src={petrologo} alt="" />
                    <h2>Petro-news</h2>
                </div>
                <nav className='header-content__nav'>
                    <ul>
                        <li><a href="#">Sport</a></li>
                        <li><a href="#">NEWS</a></li>
                        <li><a href="#">Nature</a></li>
                    </ul>
                </nav>
                <div className='header-content-sign__in'>
                {/* ДОБАВЬТЕ ЭТОТ УСЛОВНЫЙ РЕНДЕРИНГ: */}
                    {!isAuthChecked ? (
                        <div style={{ minWidth: '80px', height: '20px' }}></div> 
                        // Или <div className="spinner"></div> если у вас есть CSS для спиннера
                    ) : (
                        // После завершения проверки, рендерим кнопки/информацию в зависимости от isSignIn
                        <>
                            {!isSignIn && <button onClick={toggleFormMode}>Sign In</button>}
                            {isSignIn && currentUser && <span>{currentUser.firstName}</span>}
                            {isSignIn && !currentUser && <span>{}</span>}
                            {isSignIn && <button onClick={handleSignOut}>Выйти</button>}
                        </>
                    )}
                </div>
            </div>
               {/*  mobile */}
            <div className='header-content-mobile'>
                <div onClick={showNavMenu} className='burger-item'>
                    {isBurgerMenuOpened ? <BurgerIcon/> : <CloseMenu/>}
                </div>
                <div className='header-content-mobile__logo'>
                    <img src={petrologo} alt="" />
                    <h2>Petro-news</h2>
                </div>
                <div className='header-content-sign__in-btn'>
                    <div className='header-content-sign__in'>
                        {/* ДОБАВЬТЕ ЭТОТ УСЛОВНЫЙ РЕНДЕРИНГ: */}
                        {!isAuthChecked ? (
                            // Пока проверка не завершена, показываем заглушку (например, лоадер или просто пустой div)
                            // Рекомендуется задать минимальную ширину/высоту, чтобы избежать сдвигов макета.
                            <div style={{ minWidth: '80px', height: '20px' }}></div> 
                            // Или <div className="spinner"></div> если у вас есть CSS для спиннера
                        ) : (
                            // После завершения проверки, рендерим кнопки/информацию в зависимости от isSignIn
                            <>
                                {!isSignIn && <button onClick={toggleFormMode}>Sign In</button>}
                                {isSignIn && currentUser && <span>{currentUser.firstName}</span>}
                                {isSignIn && !currentUser && <span>{}</span>}
                                {isSignIn && <button onClick={handleSignOut}>Выйти</button>}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* list */}
            <nav className={`header-content__nav-mobile ${isNavMenuOpen ? 'header-content__nav-mobile-show' : 'header-content__nav-mobile-hide'}`}>
                <ul>
                    <li><a href="">Sport</a></li>
                    <li><a href="">NEWS</a></li>
                    <li><a href="">Nature</a></li>
                </ul>
            </nav>
            {/* form registr */}
                <>
                    {isShowModalForm ? <FormModal  handleLoginSuccess={handleLoginSuccess} handleSignInSuccess={handleSignInSuccess} closeFormModal={closeFormModal}/> : null}
                </>
        </header>
        
    )
}

export default Header;


