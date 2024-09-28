import React, { useState, useEffect } from 'react';
import '../css/game.css';
import { ScoreBoard } from '../ScoreBoard';
import { WinComp } from '../WinComp';

const usePaddleMovement = (setPaddleLeftPos, setPaddleRightPos, isGameOver) => {
    useEffect(() => {

        if (isGameOver)
            return;

        const keysPressed = {};

        const handleKeyDown = (e) => {
            keysPressed[e.key] = true;
        };

        const handleKeyUp = (e) => {
            keysPressed[e.key] = false;
        };

        const updatePaddlePositions = () => {
            if (keysPressed['w'] || keysPressed['W']) {
                setPaddleLeftPos(prevPos => Math.max(prevPos - 10, 45));
            }
            if (keysPressed['s'] || keysPressed['S']) {
                setPaddleLeftPos(prevPos => Math.min(prevPos + 10, 600 - 45));
            }
            if (keysPressed['ArrowUp']) {
                setPaddleRightPos(prevPos => Math.max(prevPos - 10, 45));
            }
            if (keysPressed['ArrowDown']) {
                setPaddleRightPos(prevPos => Math.min(prevPos + 10, 600 - 45));
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
    }, [setPaddleLeftPos, setPaddleRightPos, isGameOver]);
};

const useBallMovement = (ballPos, setBallPos, ballDir, setBallDir, paddleLeftPos, paddleRightPos, setScore1, setScore2, maxScore, setIsGameOver, setWinner, score1, score2, isGameOver) => {
    useEffect(() => {

        let animationFrameId;
        const acceleration = 1.10;
        const maxSpeed = 10;
        console.log(maxScore);

        if (isGameOver)
            return;

        const updateBallPosition = () => {
            let { x, y } = ballPos;
            let { x: dx, y: dy } = ballDir;

            x += dx;
            y += dy;

            if (
                (x <= 30 && y >= paddleLeftPos - 30 && y <= paddleLeftPos + 30) ||
                (x >= 870 && y >= paddleRightPos - 30 && y <= paddleRightPos + 30)
            ) {
                dx *= -1;

                if (x <= 30) x = 31;
                if (x >= 870) x = 869;

                if (Math.abs(dx) < maxSpeed) {
                    dx *= acceleration;
                }
                if (Math.abs(dy) < maxSpeed) {
                    dy *= acceleration;
                }
            }

            if (y <= 0 + 15 || y >= 600 - 15) {
                dy *= -1;
            }

            if (x <= 0 || x >= 900) {
                if (x <= 0) {
                    setScore2(prev => prev + 1);
                } else {
                    setScore1(prev => prev + 1);
                }
                dy = 2;
                dx = 2;
                x = 450;
                y = 300;
            }

            // Vérifier si un joueur a atteint le maxScore
            if (score1 >= maxScore) {
                setIsGameOver(true);
                setWinner("Player 1");
            } else if (score2 >= maxScore) {
                setIsGameOver(true);
                setWinner("Player 2");
            }

            setBallPos({ x, y });
            setBallDir({ x: dx, y: dy });

            if (!isGameOver) {
                animationFrameId = requestAnimationFrame(updateBallPosition);
            }
        };

        animationFrameId = requestAnimationFrame(updateBallPosition);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [ballPos, ballDir, setBallPos, setBallDir, paddleLeftPos, paddleRightPos, setScore1, setScore2, maxScore, setIsGameOver, setWinner, isGameOver]);
};

const PongSolo = ({maxScore}) => {
    //state
    const [paddleLeftPos, setPaddleLeftPos] = useState(300);
    const [paddleRightPos, setPaddleRightPos] = useState(300);
    const [ballPos, setBallPos] = useState({ x: 450, y: 300 });
    const [ballDir, setBallDir] = useState({ x: 1, y: 1 });
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState(null);

    //comportement
    usePaddleMovement(setPaddleLeftPos, setPaddleRightPos, isGameOver);
    useBallMovement(
        ballPos,
        setBallPos,
        ballDir,
        setBallDir,
        paddleLeftPos,
        paddleRightPos,
        setScore1,
        setScore2,
        maxScore,
        setIsGameOver,
        setWinner, 
        score1,
        score2,
        isGameOver
    );

    //render
    return (
        <div className="pong-container">
            <div className="board">
            <ScoreBoard score1={score1} score2={score2} maxScoreToUse={maxScore} />
            {isGameOver && winner ? <WinComp winner={winner} /> : null}
                <div className="center-line"></div>
                <div className="ball" style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className="paddle paddleleft" style={{ top: `${paddleLeftPos}px` }}></div>
                <div className="paddle paddleright" style={{ top: `${paddleRightPos}px` }}></div>
            </div>
        </div>
    );
}

export default PongSolo;
