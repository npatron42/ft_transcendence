import React, { useState } from 'react';
import Pong from './Pong';
import { ScoreBoard } from './ScoreBoard';
import { StartButton, StopButton } from './Buttons';

const GlobalGame = () => {
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [isGameActive, setIsGameActive] = useState(false);

    const handleStart = () => {
        setIsGameActive(true);
    };

    const handleStop = () => {
        setIsGameActive(false);
    };

    return (
        <div>
            <div className="buttons-container">
                <StartButton onStart={handleStart} />
                <StopButton onStop={handleStop} />
            </div>
            <ScoreBoard score1={score1} score2={score2} />
            <Pong setScore1={setScore1} setScore2={setScore2} isGameActive={isGameActive} />
        </div>
    );
};

export default GlobalGame;
