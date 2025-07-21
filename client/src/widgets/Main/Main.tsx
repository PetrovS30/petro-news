import './main.scss';
import PageMainContent from './ui/PageMainContent';
import PopularNews from './ui/PopularNews';
import LatestSportNews from './ui/LastSportNews';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { setUserDashboard } from '../../store/slice/authSlice';

const Main = () => {

/*  const navigate = useNavigate(); */
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // При заходе на главную страницу
    if (location.pathname === '/' ) {
      Cookies.remove('dashboard');
      dispatch(setUserDashboard(false));
    }
  }, [location.pathname, dispatch]);

    return (
        <main className='page-main'>
                <PageMainContent/>
            <aside className='sidebar'>
                    <PopularNews/>
                    <LatestSportNews/>
            </aside>
        </main>
    )
}

export default Main;

