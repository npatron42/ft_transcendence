import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import GlobalGameSolo from './game_page/solo/GlobalGameSolo';
import LoginPage from './login_page/loginPage';
import HomePage from './home_page/Home.jsx';
import ChooseGame from './game_page/ChooseGame';
import GlobalGameMulti from './game_page/multi/GlobalGameMulti';
import RegisterPage from './register_page/registerPage';
import GlobalTournaments from './game_page/tournaments/GlobalTournaments';
import './i18n';

const App = () => {
   return (
      <>
         <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/chooseGame" element={<ChooseGame />} />
            <Route path="/globalGameSolo" element={<GlobalGameSolo />} />
            <Route path="/globalGameMulti/:roomId" element={<GlobalGameMulti />} />
            <Route path="/globalTournaments" element={<GlobalTournaments />} />
         </Routes>
      </>
   );
};

export default App;