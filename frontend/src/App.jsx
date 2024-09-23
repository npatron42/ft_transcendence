import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import GlobalGameSolo from './game_page/solo/GlobalGameSolo';
import LoginPage from './login_page/loginPage';
import HomePage from './home_page/Home.jsx';
import ChooseGame from './game_page/ChooseGame';
import GlobalGameMulti from './game_page/multi/GlobalGameMulti';
import RegisterPage from './register_page/registerPage';
import DraggableBackground from './game_page/multi/test.jsx';
import './i18n';

const App = () => {
   return (
      <>
         <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/ChooseGame" element={<ChooseGame />} />
            <Route path="/GlobalGameSolo" element={<GlobalGameSolo />} />
            <Route path="/GlobalGameMulti/:roomId" element={<GlobalGameMulti />} />
            <Route path="/test" element={<DraggableBackground />} />
         </Routes>
      </>
   );
};

export default App;