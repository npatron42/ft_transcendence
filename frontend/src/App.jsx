import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import GlobalGameSolo from './game/solo/GlobalGameSolo'
import Home from './home_page/Home';
import Login from './Login/Login';
import ChooseGame from './game/ChooseGame';
 
const App = () => {
   return (
      <>
         <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/ChooseGame" element={<ChooseGame />} />
            <Route path="/GlobalGameSolo" element={<GlobalGameSolo />} />
         </Routes>
      </>
   );
};

export default App;
