import Header from './widgets/Header/Header';
import Main from './widgets/Main/Main';
import Footer from './widgets/Footer/Footer';
import UserDashboard from './pages/UserDashboard/UserDashboard';


import { useAuthCheck } from './shared/hooks/useAuthCheck';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.scss';

function App() {
  useAuthCheck();

  return (
    <Router>
        <Header />
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/dashboard" element={<UserDashboard />} />
            </Routes>
          <Footer />
    </Router>
  )
}

export default App


