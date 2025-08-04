import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Header from './widgets/Header/Header';
import Main from './widgets/Main/Main';
import Footer from './widgets/Footer/Footer';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import Nature from './widgets/Nature/Nature';
import News from './widgets/News/News';
import Sport from './widgets/Sport/Sport';
import SingleNewsPage from './pages/SingleNewsPage/SingleNewsPage';
import SingleNaturePage from './pages/SingleNaturePage/SingleNaturePage';
import SingleSportPage from './pages/SingleSportPage/SingleSportPage';
import AboutMe from './pages/AboutMe/AboutMe';
import { useAuthCheck } from './shared/hooks/useAuthCheck';


import './App.scss';

function App() {
    useAuthCheck();

    return (
        <Router>
            <Header />
                <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/nature" element={<Nature />} />
                <Route path="/sport" element={<Sport />} />
                <Route path="/news" element={<News />} />
                <Route path="/dashboard" element={<UserDashboard />} />

                <Route path="/news/:id" element={<SingleNewsPage />} />
                <Route path="/nature/:id"element={<SingleNaturePage/>} />
                <Route path="/sport/:id" element={<SingleSportPage/>} />

                <Route path="/about" element={<AboutMe/>} />
                </Routes>
            <Footer />
        </Router>
    )
}

export default App


