import React, { useState, useEffect, useRef } from 'react';
import '../css/miniPong.css';

const useBallMovement = (boardRef, ballPos, setBallPos, ballDir, setBallDir, paddleLeftPos, paddleRightPos, setLastPaddle) => {
    const animationFrameId = useRef(null);

    useEffect(() => {
        const updateBallPosition = () => {
            let { x, y } = ballPos;
            let { x: dx, y: dy } = ballDir;

            x += dx;
            y += dy;

            if (x <= 5 && y >= paddleLeftPos - 10 && y <= paddleLeftPos + 10) {
                setLastPaddle(1);
                dx *= -1;
            }
            if (x >= 95 && y >= paddleRightPos - 10 && y <= paddleRightPos + 10) {
                setLastPaddle(2);
                dx *= -1;
            }

            if (y <= 0 || y >= 100) {
                dy *= -1;
                y = Math.max(0, Math.min(y, 100));
            }

            if (x <= 0 || x >= 100) {
                x = 50;
                y = 50;
                dx = 1;
                dy = 1;
            }

            setBallPos({ x, y });
            setBallDir({ x: dx, y: dy });

            animationFrameId.current = requestAnimationFrame(updateBallPosition);
        };

        animationFrameId.current = requestAnimationFrame(updateBallPosition);

        return () => cancelAnimationFrame(animationFrameId.current);
    }, [ballPos, ballDir, setBallPos, setBallDir, paddleLeftPos, paddleRightPos, setLastPaddle]);
};

const usePaddleAI = (ballPos, paddleLeftPos, paddleRightPos, setPaddleLeftPos, setPaddleRightPos, lastPaddle) => {
    const animationFrameId = useRef(null);

    useEffect(() => {
        const movePaddleAI = () => {
            const paddleSpeed = 2;

            if (ballPos.y < paddleLeftPos && lastPaddle !== 1) {
                setPaddleLeftPos(prevPos => Math.max(prevPos - paddleSpeed, 0));
            } else if (ballPos.y > paddleLeftPos && lastPaddle !== 1) {
                setPaddleLeftPos(prevPos => Math.min(prevPos + paddleSpeed, 85));
            }

            if (ballPos.y < paddleRightPos && lastPaddle !== 2) {
                setPaddleRightPos(prevPos => Math.max(prevPos - paddleSpeed, 0));
            } else if (ballPos.y > paddleRightPos && lastPaddle !== 2) {
                setPaddleRightPos(prevPos => Math.min(prevPos + paddleSpeed, 85));
            }

            animationFrameId.current = requestAnimationFrame(movePaddleAI);
        };

        animationFrameId.current = requestAnimationFrame(movePaddleAI);

        return () => cancelAnimationFrame(animationFrameId.current);
    }, [ballPos, paddleLeftPos, paddleRightPos, setPaddleLeftPos, setPaddleRightPos, lastPaddle]);
};

export const MiniPong = ({ paddleSkin, boardSkin, ballSkin }) => {
    const [paddleLeftPos, setPaddleLeftPos] = useState(50);
    const [paddleRightPos, setPaddleRightPos] = useState(50);
    const [ballPos, setBallPos] = useState({ x: 50, y: 50 });
    const [ballDir, setBallDir] = useState({ x: 1, y: 1 });
    const [lastPaddle, setLastPaddle] = useState(0);
    const boardRef = useRef(null);

    usePaddleAI(ballPos, paddleLeftPos, paddleRightPos, setPaddleLeftPos, setPaddleRightPos, lastPaddle);
    useBallMovement(boardRef, ballPos, setBallPos, ballDir, setBallDir, paddleLeftPos, paddleRightPos, setLastPaddle);

    useEffect(() => {
        console.log("MiniPong props updated:", { paddleSkin, boardSkin, ballSkin });
    }, [paddleSkin, boardSkin, ballSkin]);

    return (
        <div className={boardSkin + "MiniPong"}>
            <div className="centerLineMiniPong"></div>
            <div
                className={ballSkin + "MiniPong"}
                style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
            ></div>
            <div
                className={paddleSkin + "MiniPong"}
                style={{
                    top: `${paddleLeftPos}%`,
                    left: '1.5%'
                }}
            ></div>
            <div
                className={paddleSkin + "MiniPong"}
                style={{
                    top: `${paddleRightPos}%`,
                    right: '1.5%'
                }}
            ></div>
        </div>
    );
};
