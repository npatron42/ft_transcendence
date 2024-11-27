import './App.css';
import './i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { WebSocketProvider } from './provider/WebSocketProvider.jsx';
import { TournamentSocketProvider } from './provider/TournamentSocketProvider.jsx';
import { UserAuthProvider } from './provider/UserAuthProvider.jsx';
import NavbarBS from './components/Navbar.jsx';
import GlobalGameSolo from './game_page/solo/GlobalGameSolo';
import LoginPage from './login_page/loginPage';
import HomePage from './home_page/Home.jsx';
import ChooseGame from './game_page/ChooseGame';
import GlobalGameMulti from './game_page/multi/GlobalGameMulti';
import RegisterPage from './register_page/registerPage';
import GameOptions from './components/GameOptions.jsx';
import GlobalTournaments from './game_page/tournaments/GlobalTournaments';
import ProfilPage from './profil_page/profilPage.jsx';
import Check42User from './check42user/Check42User.jsx';
import WaitingTournaments from './game_page/tournaments/WaitingTournaments';
import ViewProfile from './view_profile/ViewProfile.jsx';
import GameSettings from './game_page/settings/GameSettings.jsx';
import Error404 from './errors_pages/404.jsx';

const App = () => {
  const location = useLocation();
  const publicPaths = ["/", "/register", "/check42user"];
  const isPublicRoute = publicPaths.includes(location.pathname);

  return (
    <UserAuthProvider>
      {isPublicRoute ? (
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/check42user" element={<Check42User />} />
        </Routes>
      ) : (
        <WebSocketProvider>
          <TournamentSocketProvider>
          <NavbarBS />
          <Routes>
            <Route path="/profile" element={<ProfilPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/ChooseGame" element={<ChooseGame />} />
            <Route path="/GlobalGameSolo/:roomId" element={<GlobalGameSolo />} />
            <Route path="/GlobalGameMulti/:roomId" element={<GlobalGameMulti />} />
            <Route path="/globalTournaments" element={<GlobalTournaments />} />
            <Route path="/game/options" element={<GameOptions />} />
            <Route path="/waitingTournaments" element={<GlobalTournaments />} />
            <Route path="/profile/:username" element={<ViewProfile />} />
            <Route path="/game-settings" element={<GameSettings />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </TournamentSocketProvider>
      </WebSocketProvider>
    )}
    </UserAuthProvider>
  );
};

export default App;
