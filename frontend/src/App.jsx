import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import GlobalGameSolo from './game_page/solo/GlobalGameSolo'
import Home from './home_page/Home';
import Login from './Login/Login';
import ChooseGame from './game_page/ChooseGame';
import GlobalGameMulti from './game_page/multi/GlobalGameMulti';
 
const App = () => {
   return (
      <>
         <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/ChooseGame" element={<ChooseGame />} />
            <Route path="/GlobalGameSolo" element={<GlobalGameSolo />} />
            <Route path="/GlobalGameMulti" element={<GlobalGameMulti />} />
         </Routes>
      </>
   );
};

export default App;
