import React, { useState } from 'react';
import './pong.css';

export const StartButton = ({ onStart }) => {
    return (
        <div className="button" onClick={onStart}> Start </div>
    );
};

const Pong = () => {
    const [paddleLeftPos, setPaddleLeftPos] = useState(250);
    const [paddleRightPos, setPaddleRightPos] = useState(250);
    const [ballPos, setBallPos] = useState({ x: 400, y: 300 });
    const [ballDir, setBallDir] = useState({ x: 1, y: 1 });


    const start = () => {
        setPaddleLeftPos(prevPos => prevPos + 10);
    };

    return (
        <div className="pong-container">
            <div className="board">
                <div className="ball" style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className="paddle paddleleft" style={{ top: `${paddleLeftPos}px` }}></div>
                <div className="paddle paddleright" style={{ top: `${paddleRightPos}px` }}></div>
            </div>
        </div>
    );
};

export default Pong;
