import React, { useState, useEffect } from 'react';
import '../css/game.css';

// Hook pour la gestion des mouvements des raquettes
const usePaddleMovement = (webSocket, isGameActive) => {
    useEffect(() => {
        if (!isGameActive || !webSocket) return;
    
        const keysPressed = {};

        const handleKeyDown = (e) => {
            keysPressed[e.key] = true;

            if (keysPressed['w'] || keysPressed['W']) {
                webSocket.send(JSON.stringify({ action: 'paddleup', side: 'left' }));
            }
            if (keysPressed['s'] || keysPressed['S']) {
                webSocket.send(JSON.stringify({ action: 'paddledown', side: 'left' }));
            }
            if (keysPressed['ArrowUp']) {
                webSocket.send(JSON.stringify({ action: 'paddleup', side: 'right' }));
            }
            if (keysPressed['ArrowDown']) {
                webSocket.send(JSON.stringify({ action: 'paddledown', side: 'right' }));
            }
        };

        const handleKeyUp = (e) => {
            keysPressed[e.key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [webSocket, isGameActive]);
};

const PongMulti = ({ roomId, isGameActive }) => {
    const [paddleLeftPos, setPaddleLeftPos] = useState(300);
    const [paddleRightPos, setPaddleRightPos] = useState(300);
    const [ballPos, setBallPos] = useState({ x: 400, y: 300 });
    const [webSocket, setWebSocket] = useState(null);

    // Initialisation du WebSocket
    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/pong/${roomId}`);

        ws.onopen = () => {
            console.log('WebSocket connecté à la room:', roomId);
            ws.send(JSON.stringify({
                message: 'Salut Serveur Pong!',
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.paddles) {
                setPaddleLeftPos(data.paddles.left);
                setPaddleRightPos(data.paddles.right);
            }
            if (data.ball) {
                setBallPos(data.ball);
            }
            console.log("Message reçu du serveur:", data);
        };

        ws.onclose = (event) => {
            console.log('WebSocket fermé, code :', event.code);
        };

        ws.onerror = (error) => {
            console.error('Erreur WebSocket :', error);
        };

        setWebSocket(ws);

        return () => {
            if (ws) ws.close();
        };
    }, [roomId]);

    // Utiliser le hook pour la gestion des mouvements
    usePaddleMovement(webSocket, isGameActive);

    return (
        <div className="pong-container">
            <h1>Room ID : {roomId}</h1>
            <div className="board">
                <div className="ball" style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className="paddle paddleleft" style={{ top: `${paddleLeftPos}px` }}></div>
                <div className="paddle paddleright" style={{ top: `${paddleRightPos}px` }}></div>
            </div>
        </div> 
    );
}

export default PongMulti;
