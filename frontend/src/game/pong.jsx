import React, { useState, useEffect } from 'react';
import './pong.css';

// Composant pour le bouton Start
export const StartButton = ({ onStart }) => {
    return (
        <div className="button" onClick={onStart}> Start </div>
    );
};

export const StopButton = ({ onStop }) => {
    return (
        <div className="button" onClick={onStop}> Stop </div>
    );
};

// Hook pour gérer les mouvements des paddles
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
            if (keysPressed['ArrowUp']) {
                setPaddleLeftPos(prevPos => Math.max(prevPos - 5, 40));
            }
            if (keysPressed['ArrowDown']) {
                setPaddleLeftPos(prevPos => Math.min(prevPos + 5, 600 - 40));
            }
            if (keysPressed['w'] || keysPressed['W']) {
                setPaddleRightPos(prevPos => Math.max(prevPos - 5, 40));
            }
            if (keysPressed['s'] || keysPressed['S']) {
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

// Hook pour gérer le mouvement de la balle
const useBallMovement = (ballPos, setBallPos, ballDir, setBallDir, paddleLeftPos, paddleRightPos, isGameActive) => {
    useEffect(() => {
        if (!isGameActive) 
            return;

        const updateBallPosition = () => {
            let { x, y } = ballPos;
            let { x: dx, y: dy } = ballDir;

            x += dx;
            y += dy;

            if (
                (x <= 30 && y >= paddleLeftPos && y <= paddleLeftPos) ||
                (x >= 770 && y >= paddleRightPos && y <= paddleRightPos)
            ) {
                dx *= -1;
            }

            if (y <= 0 || y >= 600 - 15) {
                dy *= -1;
            }

            if (x <= 0 || x >= 800 - 15) {
                x = 400;
                y = 300;
                dx = 2;
                dy = 2;
            }

            setBallPos({ x, y });
            setBallDir({ x: dx, y: dy });

            requestAnimationFrame(updateBallPosition);
        };

        requestAnimationFrame(updateBallPosition);
        return () => {
            cancelAnimationFrame(updateBallPosition);
        };
    }, [ballPos, ballDir, setBallPos, setBallDir, paddleLeftPos, paddleRightPos, isGameActive]);
};

// Composant Pong
const Pong = () => {
    const [paddleLeftPos, setPaddleLeftPos] = useState(300);
    const [paddleRightPos, setPaddleRightPos] = useState(300);
    const [ballPos, setBallPos] = useState({ x: 400, y: 300 });
    const [ballDir, setBallDir] = useState({ x: 1, y: 1 });
    const [isGameActive, setIsGameActive] = useState(false);

    usePaddleMovement(setPaddleLeftPos, setPaddleRightPos, isGameActive);
    useBallMovement(ballPos, setBallPos, ballDir, setBallDir, paddleLeftPos, paddleRightPos, isGameActive);

    const resetGame = () => {
        setPaddleLeftPos(300);
        setPaddleRightPos(300);
        setBallPos({ x: 400, y: 300 });
        setBallDir({ x: 1, y: 1 });
        setIsGameActive(false);
    };

    const handleStart = () => {
        setIsGameActive(true);
    };

    const handleStop = () => {
        resetGame();
    };

    useEffect(() => {
        if (!isGameActive) {
            resetGame();
        }
    }, [isGameActive]);

    return (
        <div className="pong-container">
            <div className="buttons-container">
                <StartButton onStart={handleStart} />
                <StopButton onStop={handleStop} />
            </div>
            <div className="board">
                <div className="ball" style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className="paddle paddleleft" style={{ top: `${paddleLeftPos}px` }}></div>
                <div className="paddle paddleright" style={{ top: `${paddleRightPos}px` }}></div>
            </div>
        </div>
    );
}

export default Pong;
