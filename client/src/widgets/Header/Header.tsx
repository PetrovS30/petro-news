import { useState, useEffect, useRef} from 'react';
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
    const [dropDownMenu, setDropDownMenu] = useState(false);
    const dropdownRef = useRef(null); // 👈 Создаем ref для выпадающего меню

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
        setDropDownMenu(false);
    }

    const showNavMenu = () =>  {
        setIsNavMenuOpen(isNavMenuOpen => !isNavMenuOpen);
        setIsBurgerMenuOpened(!isBurgerMenuOpened);
        setDropDownMenu(false);
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

// 👈 useEffect для добавления и удаления слушателя события
    useEffect(() => {
        const handleClickOutside = (event) => {

            if (dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setDropDownMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // Пустой массив зависимостей означает, что эффект запустится один раз при монтировании


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
            setDropDownMenu(true);
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
                        <li><Link to='/sport'>Sport</Link></li>
                        <li><Link to='/news'>NEWS</Link></li>
                        <li><Link to='/nature'>Nature</Link></li>
                    </ul>
                </nav>
                <div className='header-content-sign__in'>

                    {!isAuthChecked ? (
                        <div style={{ minWidth: '80px', height: '20px' }}></div> 
                    ) : (
                        <>
                            {!isSignIn && <button onClick={toggleFormMode}>Sign In</button>}
                            {isSignIn && isCurrentUser && 
                            <span style={{marginRight: "12px"}}>{isCurrentUser.firstName}<br/>
                            <Link onClick={() => toggleUserDashboard(true)} to="/dashboard">Личный кабинет</Link></span>}
                            {dropDownMenu && <div  ref={dropdownRef}  className='drop-down-menu'>
                                    <Link to='/dashboard?tab=newTop'><div>Добавить тему</div></Link>
                                    <Link to='/dashboard?tab=settings'><div>Личный кабинет</div></Link>
                                    <div onClick={handleSignOut}>выход</div>
                                </div>}
                        </>
                    )}

                </div>
            </div>
               {/*  mobile header*/}
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

                        {!isAuthChecked ? (
                            <div style={{ minWidth: '80px', height: '20px' }}></div> 
                        ) : (
                            <>
                                {!isSignIn && <button onClick={toggleFormMode}>Sign In</button>}
                                {isSignIn && isCurrentUser && 
                                <span style={{marginRight: "12px"}}>{isCurrentUser.firstName}<br/>
                                <Link onClick={() => toggleUserDashboard(true)} to="/dashboard">Личный кабинет</Link></span>}
                            {dropDownMenu && <div  ref={dropdownRef}  className='drop-down-menu'>
                                    <Link to='/dashboard?tab=newTop'><div>Добавить тему</div></Link>
                                    <Link to='/dashboard?tab=settings'><div>Личный кабинет</div></Link>
                                    <div onClick={handleSignOut}>выход</div>
                                </div>}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* list */}
            <nav className={`header-content__nav-mobile ${isNavMenuOpen ? 'header-content__nav-mobile-show' : 'header-content__nav-mobile-hide'}`}>
                <ul>
                    <li><Link to='/sport'>Sport</Link></li>
                    <li><Link to='/news'>NEWS</Link></li>
                    <li><Link to='/nature'>Nature</Link></li>
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

