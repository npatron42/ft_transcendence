import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './login_page/loginPage';
import RegisterPage from './register_page/registerPage';
import './i18n';



function App(){
  return (
      <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
      </Routes>
  );
}

export default App;
