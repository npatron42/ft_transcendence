// App.js
import React from 'react';
import GlobalGame from "./game/GlobalGame";
import './App.css'
import axios from 'axios';
import Container from './home_page/Tess';
import 'bootstrap/dist/css/bootstrap.min.css';
import Tess from './home_page/Tess';
import background from "./assets/back.svg";

const App = () => {
  return (
    <div className="background-container">
      <div className="App">gi 
      <GlobalGame />
      </div>
    </div>
  );
};

export default App;
