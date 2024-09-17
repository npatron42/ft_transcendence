import React, { useState } from 'react';
import PongSolo from './PongSolo';
import { ScoreBoard } from '../ScoreBoard';

const GlobalGameSolo = () => {
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);

    return (
        <div className="GlobalGame">
            <ScoreBoard score1={score1} score2={score2} />
            <PongSolo setScore1={setScore1} setScore2={setScore2} isGameActive={isGameActive} />
        </div>
    );
};

export default GlobalGameSolo;