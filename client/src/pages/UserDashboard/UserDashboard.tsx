import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

import { useDispatch} from "react-redux";
import { useSelector } from "react-redux";

import { setCurrentUser,setSignIn } from "../../store/slice/authSlice";
import { setUserDashboard } from "../../store/slice/authSlice";
import ChangePassword from "./ui/ChangePassword";
import PersonalInfo from './ui/PersonalInfo';
import NewTopic from "./ui/NewTopic";
import  MyTopic from "./ui/MyTopic";
import './userDashboard.scss';



const UserDashboard = () => {
    const {isSignIn, isCurrentUser} = useSelector(state => state.authReducer);
    const firstName = isCurrentUser?.firstName; // Опциональная цепочка (`?.`)
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('settings');

          // Меняем URL при выборе вкладки
    const handleTabChange = (tab : string) => {
        setActiveTab(tab);
        navigate(`?tab=${tab}`); // Просто добавляем параметр в URL
    };

    // При загрузке страницы проверяем параметр из URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['settings', 'myTop', 'functions', 'newTop'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);


    useEffect(() => {
        if(isSignIn) {
            Cookies.set('dashboard', 'true', { expires: 1 });
            dispatch(setUserDashboard(true));
            Cookies.set('isSignIn', "true", {expires: 1});
        }

        // Дополнительная проверка на случай, если куки отключены
        if (!Cookies.get('dashboard')) {
          navigate('/', { replace: true });
        }
    }, [navigate, dispatch, isSignIn]);

    const handleSignOut = () => {
        setActiveTab('');
        dispatch(setSignIn(false));
        dispatch(setCurrentUser(null));
        Cookies.remove('user');
        Cookies.remove('authToken');
        Cookies.remove('isSignIn', { path: '/' });
        Cookies.remove('dashboard');
    }

  return (

      <div className="dashboard-container">
        <div  className='container-flex-centered'>
          <div className="dashboard-content-wrapper">
              <div className="dashboard-sidebar" >
                <h2>Welcome, {firstName}</h2>
                <nav aria-label="Управление личным кабинетом">
                  <ul>
                    <li>
                      <button onClick={() => handleTabChange('newTop')} type="button">Добавить новую тему</button>
                    </li>
                    <li>
                      <button onClick={() => handleTabChange('myTop')} type="button">Мои темы</button>
                    </li>
                    <li>
                      <button onClick={() => handleTabChange('functions')} type="button">Change password</button>
                    </li>
                    <li>
                      <button onClick={() => handleTabChange('settings')} type="button">Settings</button>
                    </li>
                    <li>
                      <button onClick={() => handleSignOut()} type="button">Sign out</button>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="dashboard-main-content">
                      {activeTab === "settings" ? <PersonalInfo/> : null}

                      {activeTab === "myTop" ? <MyTopic/> : null}

                      {activeTab === "functions" ? <ChangePassword/> : null} 

                      {activeTab === "newTop" ? <NewTopic/> : null }
              </div>
            </div>
        </div>
    </div>
  );
};

export default UserDashboard;