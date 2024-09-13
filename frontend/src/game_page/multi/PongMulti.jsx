import React, { useState, useEffect } from 'react';
import '../css/game.css';

// Hook pour la gestion des mouvements des raquettes
const usePaddleMovement = (setPaddleLeftPos, setPaddleRightPos, isGameActive, roomName) => {
    useEffect(() => {
        if (!isGameActive) return;

        // Connexion WebSocket avec le nom de la room
        const ws = new WebSocket(`ws://localhost:8000/ws/pong/${roomName}/`);
        
        ws.onopen = () => {
            console.log('WebSocket connecté à la room:', roomName);
            ws.send(JSON.stringify({ message: 'Salut Serveur Pong!' }));
        };
    
        ws.onclose = (event) => {
            console.log('WebSocket fermé, code :', event.code);
        };
    
        ws.onerror = (error) => {
            console.error('Erreur WebSocket :', error);
        };
    
        const keysPressed = {};
    
        const handleKeyDown = (e) => {
            keysPressed[e.key] = true;
        };
    
        const handleKeyUp = (e) => {
            keysPressed[e.key] = false;
        };
    
        const updatePaddlePositions = () => {
            // Mouvement raquette gauche
            if (keysPressed['w'] || keysPressed['W']) {
                ws.send(JSON.stringify({ action: 'paddleup' }));
                setPaddleLeftPos(prevPos => Math.max(prevPos - 10, 40));
            }
            if (keysPressed['s'] || keysPressed['S']) {
                ws.send(JSON.stringify({ action: 'paddledown' }));
                setPaddleLeftPos(prevPos => Math.min(prevPos + 10, 600 - 40));
            }

            // Mouvement raquette droite
            if (keysPressed['ArrowUp']) {
                ws.send(JSON.stringify({ action: 'paddleup' }));
                setPaddleRightPos(prevPos => Math.max(prevPos - 10, 40));
            }
            if (keysPressed['ArrowDown']) {
                ws.send(JSON.stringify({ action: 'paddledown' }));
                setPaddleRightPos(prevPos => Math.min(prevPos + 10, 600 - 40));
            }
    
            requestAnimationFrame(updatePaddlePositions);
        };
    
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    
        requestAnimationFrame(updatePaddlePositions);
    
        return () => {
            ws.close();  // Fermer proprement la connexion WebSocket
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [setPaddleLeftPos, setPaddleRightPos, isGameActive, roomName]);
};

// Hook pour la gestion des mouvements de la balle
const useBallMovement = (ballPos, setBallPos, ballDir, setBallDir, paddleLeftPos, paddleRightPos, isGameActive, setScore1, setScore2) => {
    useEffect(() => {
        if (!isGameActive) return;

        let animationFrameId;
        const acceleration = 1.10;
        const maxSpeed = 10;

        const updateBallPosition = () => {
            let { x, y } = ballPos;
            let { x: dx, y: dy } = ballDir;

            x += dx;
            y += dy;

            // Collision avec les raquettes
            if (
                (x <= 30 && y >= paddleLeftPos - 30 && y <= paddleLeftPos + 30) ||
                (x >= 770 && y >= paddleRightPos - 30 && y <= paddleRightPos + 30)
            ) {
                dx *= -1;

                if (x <= 30) x = 31;
                if (x >= 770) x = 769;

                if (Math.abs(dx) < maxSpeed) {
                    dx *= acceleration;
                }
                if (Math.abs(dy) < maxSpeed) {
                    dy *= acceleration;
                }
            }

            // Collision avec les murs (haut et bas)
            if (y <= 0 + 15 || y >= 600 - 15) {
                dy *= -1;
            }

            // Ballon sort des limites, mise à jour du score
            if (x <= 0 || x >= 800) {
                if (x <= 0) {
                    setScore2(prev => prev + 1);
                } else {
                    setScore1(prev => prev + 1);
                }
                dy = 2;
                dx = 2;
                x = 400;
                y = 300;
            }
            setBallPos({ x, y });
            setBallDir({ x: dx, y: dy });

            animationFrameId = requestAnimationFrame(updateBallPosition);
        };

        animationFrameId = requestAnimationFrame(updateBallPosition);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [ballPos, ballDir, setBallPos, setBallDir, paddleLeftPos, paddleRightPos, isGameActive, setScore1, setScore2]);
};

const PongMulti = ({ score1, score2, setScore1, setScore2, isGameActive, roomName }) => {
    // États
    const [paddleLeftPos, setPaddleLeftPos] = useState(300);
    const [paddleRightPos, setPaddleRightPos] = useState(300);
    const [ballPos, setBallPos] = useState({ x: 400, y: 300 });
    const [ballDir, setBallDir] = useState({ x: 1, y: 1 });

    // Comportement : mouvements des raquettes et de la balle
    usePaddleMovement(setPaddleLeftPos, setPaddleRightPos, isGameActive, roomName);
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

    // Rendu
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

export default PongMulti;
