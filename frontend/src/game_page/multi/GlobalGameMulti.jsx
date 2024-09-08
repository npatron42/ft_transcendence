import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import PongMulti from './PongMulti';
import { ScoreBoard } from '../ScoreBoard';
import { StartButton, StopButton } from '../Buttons';

const GlobalGameMulti = () => {
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [isGameActive, setIsGameActive] = useState(false);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/pong/');
        console.log('Tentative de connexion au WebSocket');
      
        ws.onopen = () => {
          console.log('WebSocket connecté');
          ws.send(JSON.stringify({ message: 'Salut Serveur Pong!' }));
        };
      
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('Message reçu du serveur : ', data.message);
        };
      
        return () => {
          ws.close();
        };
      }, []);

    const handleStart = () => {
        setIsGameActive(true);
    };

    const handleStop = () => {
        setIsGameActive(false);
    };

    return (
        <div className="GlobalGame">
            <div className="buttons-container">
                <StartButton onStart={handleStart} />
                <StopButton onStop={handleStop} />
            </div>
            <ScoreBoard score1={score1} score2={score2} />
            <PongMulti setScore1={setScore1} setScore2={setScore2} isGameActive={isGameActive} />
        </div>
    );
};

export default GlobalGameMulti;
