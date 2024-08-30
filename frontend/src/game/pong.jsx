import React, { useState, useEffect } from 'react';
import './style.css';

const usePaddleMovement = (setPaddleLeftPos, setPaddleRightPos, isGameActive) => {
    useEffect(() => {
        if (!isGameActive) return;

        const keysPressed = {};

        const handleKeyDown = (e) => {
            keysPressed[e.key] = true;
        };

        const handleKeyUp = (e) => {
            keysPressed[e.key] = false;
        };

        const updatePaddlePositions = () => {
            if (keysPressed['w']) {
                setPaddleLeftPos(prevPos => Math.max(prevPos - 5, 40));
            }
            if (keysPressed['s']) {
                setPaddleLeftPos(prevPos => Math.min(prevPos + 5, 600 - 40));
            }
            if (keysPressed['ArrowUp'] || keysPressed['W']) {
                setPaddleRightPos(prevPos => Math.max(prevPos - 5, 40));
            }
            if (keysPressed['ArrowDown'] || keysPressed['S']) {
                setPaddleRightPos(prevPos => Math.min(prevPos + 5, 600 - 40));
            }

            requestAnimationFrame(updatePaddlePositions);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        requestAnimationFrame(updatePaddlePositions);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [setPaddleLeftPos, setPaddleRightPos, isGameActive]);
};

const useBallMovement = (ballPos, setBallPos, ballDir, setBallDir, paddleLeftPos, paddleRightPos, isGameActive, setScore1, setScore2) => {
    useEffect(() => {
        if (!isGameActive) return;

        const updateBallPosition = () => {
            let { x, y } = ballPos;
            let { x: dx, y: dy } = ballDir;

            x += dx;
            y += dy;

            if (
                (x <= 30 && y >= paddleLeftPos - 30 && y <= paddleLeftPos + 30) ||
                (x >= 770 && y >= paddleRightPos - 30 && y <= paddleRightPos + 30)
            ) {
                dx *= -1;
            }

            if (y <= 15 || y >= 600 - 15) {
                dy *= -1;
            }

            if (x <= 0 || x >= 800 - 15) {
                if (x <= 0) {
                    console.log('Player 2 scores');
                    setScore2(prev => prev + 1);
                } else {
                    console.log('Player 1 scores');
                    setScore1(prev => prev + 1);
                }

                x = 400;
                y = 300;
                dx = 1;
                dy = 1;
            }

            setBallPos({ x, y });
            setBallDir({ x: dx, y: dy });

            requestAnimationFrame(updateBallPosition);
        };

        requestAnimationFrame(updateBallPosition);
        return () => {
            cancelAnimationFrame(updateBallPosition);
        };
    }, [ballPos, ballDir, setBallPos, setBallDir, paddleLeftPos, paddleRightPos, isGameActive, setScore1, setScore2]);
};

const Pong = ({ score1, score2, setScore1, setScore2, isGameActive }) => {
    const [paddleLeftPos, setPaddleLeftPos] = useState(300);
    const [paddleRightPos, setPaddleRightPos] = useState(300);
    const [ballPos, setBallPos] = useState({ x: 400, y: 300 });
    const [ballDir, setBallDir] = useState({ x: 1, y: 1 });

    usePaddleMovement(setPaddleLeftPos, setPaddleRightPos, isGameActive);
    useBallMovement(
        ballPos,
        setBallPos,
        ballDir,
        setBallDir,
        paddleLeftPos,
        paddleRightPos,
        isGameActive,
        setScore1,
        setScore2
    );

    return (
        <div className="pong-container">
            <div className="board">
                <div className="ball" style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className="paddle paddleleft" style={{ top: `${paddleLeftPos}px` }}></div>
                <div className="paddle paddleright" style={{ top: `${paddleRightPos}px` }}></div>
            </div>
        </div>
    );
}

export default Pong;
