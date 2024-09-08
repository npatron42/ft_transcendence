import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './login_page/loginPage';
import HomePage from './home_page/Home.jsx';
import RegisterPage from './register_page/registerPage';
import './i18n';



function App(){
  return (
      <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage />} />
      </Routes>
  );
}

export default App;
