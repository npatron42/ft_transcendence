import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import Home from './home_page/Home';
import Login from './Login/Login';

 
const App = () => {
   return (
      <>
         <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
         </Routes>
      </>
   );
};

export default App;
