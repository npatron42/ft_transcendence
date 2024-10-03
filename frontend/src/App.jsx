import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import NavbarBS from './components/Navbar.jsx';
import GlobalGameSolo from './game_page/solo/GlobalGameSolo';
import LoginPage from './login_page/loginPage';
import HomePage from './home_page/Home.jsx';
import ChooseGame from './game_page/ChooseGame';
import GlobalGameMulti from './game_page/multi/GlobalGameMulti';
import RegisterPage from './register_page/registerPage';
import GlobalTournaments from './game_page/tournaments/GlobalTournaments';
import { getUser } from './api/api.js';
import './i18n';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { WebSocketProvider } from './provider/WebSocketProvider.jsx';

const App = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const hideNavbarPaths = ['/', '/register'];

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };

    fetchUser();
  }, []);

  return (
    <>
      
      <WebSocketProvider>
      {!hideNavbarPaths.includes(location.pathname) && <NavbarBS myUser={user} />}
      <Routes>

        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ChooseGame" element={<ChooseGame />} />
        <Route path="/GlobalGameSolo" element={<GlobalGameSolo />} />
        <Route path="/GlobalGameMulti/:roomId" element={<GlobalGameMulti />} />
        <Route path="/globalTournaments" element={<GlobalTournaments />} />

      </Routes>
      </WebSocketProvider>
    </>
  );
};


export default App;