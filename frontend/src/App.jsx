import React from 'react';
import './App.css';
import './game/pong.css';
import Pong from './game/Pong.jsx';
import { StartButton } from './game/Pong.jsx';

function App() {
  return (
    <div className="App">
      <StartButton />
      <Pong />
    </div>
  );
}

export default App;
