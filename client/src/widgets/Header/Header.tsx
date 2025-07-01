import { useState, useEffect} from 'react';
import {useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';


import FormModal from '../Header/ui/formModal/FormModal';
import BurgerIcon from './ui/burgerMenu/BurgerMenu';
import CloseMenu from './ui/closeBurgerMenuBtn/CloseBurgerMenuBtn';
import {setCurrentUser, setSignIn, setUserDashboard}  from '../../store/slice/authSlice';
import petrologo from '../../assets/images/petro-news-logo.svg';

import './header.scss';


const Header = () => {
    const mobileBreakpoint = 768;
    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
    const [isBurgerMenuOpened,setIsBurgerMenuOpened] = useState(true);
    const [isShowModalForm, setShowModalForm] = useState(false);

    const {isAuthChecked, isSignIn, isCurrentUser} = useSelector(
        (state : {authReducer: {
            isAuthChecked : boolean,
            isSignIn: boolean,
            isCurrentUser: any,
            isUserDashboard: boolean
        }})=> state.authReducer
    ) ;

    const dispatch = useDispatch();

    const handleSignOut = () => {
        dispatch(setSignIn(false));
        dispatch(setCurrentUser(null));
        Cookies.remove('user');
        Cookies.remove('authToken');
        Cookies.remove('isSignIn', { path: '/' });
        Cookies.remove('dashboard');
    }

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

    const toggleUserDashboard = (bln: boolean) => {
        if(bln) {
            Cookies.set('dashboard', "true");
            dispatch(setUserDashboard(bln));
/*             Cookies.set('isSignIn', "true"); */
        } 
    }

    return(
        <header className='header'>
            <div className='header-content'>
                <div className='header-content__logo'>
                    <img src={petrologo} alt="" />
                    <Link onClick={() => toggleUserDashboard(false)} to='/'><h2>Petro-news</h2></Link>
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
                    ) : (
                        <>
                            {!isSignIn && <button onClick={toggleFormMode}>Sign In</button>}
                            {isSignIn && isCurrentUser && <span>{isCurrentUser.firstName}<br/><Link onClick={() => toggleUserDashboard(true)} to="/dashboard">Личный кабинет</Link></span>}
                            {isSignIn && !isCurrentUser && <span>{}</span>}
                            {isSignIn && <button onClick={handleSignOut}><span>Выйти</span></button>}
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

                            <div style={{ minWidth: '80px', height: '20px' }}></div> 
                        ) : (

                            <>
                                {!isSignIn && <button onClick={toggleFormMode}>Sign In</button>}
                                {isSignIn && isCurrentUser && <span>{isCurrentUser.firstName}</span>}
                                {isSignIn && !isCurrentUser && <span>{}</span>}
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
                    {isShowModalForm ? 
                        <FormModal  closeFormModal={closeFormModal}/> : null}
                </>
        </header>
        
    )
}

export default Header;


