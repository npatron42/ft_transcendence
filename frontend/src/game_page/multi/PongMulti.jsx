import React, { useState, useEffect } from 'react';
import '../css/game.css';
import { WinComp } from '../WinComp';
import { ScoreBoard } from '../ScoreBoard';

const usePaddleMovement = (webSocket, playerId) => {
    const [keysPressed, setKeysPressed] = useState({});

    useEffect(() => {
        if (!webSocket) return;

        const handleKeyDown = (e) => {
            console.log(`Key pressed: ${e.key}`);
            setKeysPressed((prev) => ({ ...prev, [e.key]: true }));
        };

        const handleKeyUp = (e) => {
            console.log(`Key released: ${e.key}`);
            setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [webSocket]);

    useEffect(() => {
        if (!webSocket) return;

        const interval = setInterval(() => {
            if (keysPressed['w'] || keysPressed['W']) {
                webSocket.send(JSON.stringify({ action: 'paddleup', id: playerId }));
            }
            if (keysPressed['s'] || keysPressed['S']) {
                webSocket.send(JSON.stringify({ action: 'paddledown', id: playerId }));
            }
            if (keysPressed['ArrowUp']) {
                webSocket.send(JSON.stringify({ action: 'paddleup', id: playerId }));
            }
            if (keysPressed['ArrowDown']) {
                webSocket.send(JSON.stringify({ action: 'paddledown', id: playerId }));
            }
        }, 11);

        return () => clearInterval(interval);
    }, [keysPressed, webSocket, playerId]);
};

const PongMulti = ({ roomId, maxScore }) => {
    const [paddleLeftPos, setPaddleLeftPos] = useState(300);
    const [paddleRightPos, setPaddleRightPos] = useState(300);
    const [ballPos, setBallPos] = useState({ x: 450, y: 300 });
    const [webSocket, setWebSocket] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [roomPlayers, setRoomPlayers] = useState([]);
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);

    useEffect(() => {


        /*-------------------*/
        /* gestion websocket */
        /*-------------------*/

        /*const myJwt = localStorage.getItem("jwt");
        const myUrl = "ws://localhost:8000/ws/pong/" + roomId + "/?token=" + myJwt;
        const ws = new WebSocket(myUrl);*/
        const ws = new WebSocket(`ws://localhost:8000/ws/pong/${roomId}`);

        ws.onopen = () => {
            console.log('WebSocket connecté à la room:', roomId);
            const maxScoreNum = Number(maxScore);
            ws.send(JSON.stringify({ action: 'set_max_score', maxScore: maxScoreNum }));
            
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(event.data);
            if (data.id) {
                setPlayerId(data.id);
            }
            if (data.players) {
                setRoomPlayers(data.players);
            }
            if (data.paddles) {
                setPaddleLeftPos(data.paddles.left);
                setPaddleRightPos(data.paddles.right);
            }
            if (data.ball) {
                setBallPos(data.ball);
            }
            if (data.score) {
                setScore1(data.score.player1);
                setScore2(data.score.player2);

                if (data.score.player1 >= maxScore) {
                    setIsGameOver(true);
                    setWinner(1);
                } else if (data.score.player2 >= maxScore) {
                    setIsGameOver(true);
                    setWinner(2);
                }
            }
        };

        ws.onclose = (event) => {
            console.log('WebSocket fermé, code :', event.code);
        };

        ws.onerror = (error) => {
            console.error('Erreur WebSocket :', error);
        };

        setWebSocket(ws);

        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [roomId, maxScore, setScore1, setScore2]);

    usePaddleMovement(webSocket, playerId, roomPlayers);

    return (
        <div className="pong-container">
            <ScoreBoard score1={score1} score2={score2} player1Id={roomPlayers[0]} player2Id={roomPlayers[1]} />
            {isGameOver && <WinComp winner={winner} />}
            <div className="board">
                <div className="center-line"></div>
                <div className="ball" style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className="paddle paddleleft" style={{ top: `${paddleLeftPos}px` }}></div>
                <div className="paddle paddleright" style={{ top: `${paddleRightPos}px` }}></div>
            </div>
        </div>
    );
};

export default PongMulti;
