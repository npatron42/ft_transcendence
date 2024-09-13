import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import du hook useParams
import PongMulti from './PongMulti';
import { ScoreBoard } from '../ScoreBoard';
import { StartButton, StopButton } from '../Buttons';

const GlobalGameMulti = () => {
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [isGameActive, setIsGameActive] = useState(false);
    const { roomId } = useParams(); // Récupération de roomId depuis l'URL

    // Fonction pour démarrer le jeu
    const handleStart = () => {
        setIsGameActive(true);
    };

    // Fonction pour arrêter le jeu
    const handleStop = () => {
        setIsGameActive(false);
    };

    return (
        <div className="GlobalGame">
            <h1>Jeu Multijoueur - Room ID: {roomId}</h1> {/* Affichage du Room ID */}
            <div className="buttons-container">
                <StartButton onStart={handleStart} />
                <StopButton onStop={handleStop} />
            </div>
            <ScoreBoard score1={score1} score2={score2} />
            <PongMulti 
                setScore1={setScore1} 
                setScore2={setScore2} 
                isGameActive={isGameActive} 
                roomId={roomId}
            />
        </div>
    );
};

export default GlobalGameMulti;
