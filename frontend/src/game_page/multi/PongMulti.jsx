import React, { useState, useEffect } from 'react';
import '../css/game.css';
import { WinComp } from '../WinComp';
import { ScoreBoard } from '../ScoreBoard';
import { useAuth } from '../../provider/UserAuthProvider';

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
                webSocket.send(JSON.stringify({ action: 'paddleup' }));
            }
            if (keysPressed['s'] || keysPressed['S']) {
                webSocket.send(JSON.stringify({ action: 'paddledown' }));
            }
            if (keysPressed['ArrowUp']) {
                webSocket.send(JSON.stringify({ action: 'paddleup' }));
            }
            if (keysPressed['ArrowDown']) {
                webSocket.send(JSON.stringify({ action: 'paddledown' }));
            }
        }, 11);

        return () => clearInterval(interval);
    }, [keysPressed, webSocket]);
};

const PongMulti = ({ roomId, maxScore, powerUp }) => {
    const [paddlePos, setPaddlePos] = useState({ left: 300, right: 300 });
    const [paddleSizes, setPaddleSizes] = useState({ left: 90, right: 90 });
    const [ballPos, setBallPos] = useState({ x: 450, y: 300 });
    const [scores, setScores] = useState({ player1: 0, player2: 0 });
    const [powerUpPosition, setPowerUpPosition] = useState({ x: 0, y: 0 });
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [roomPlayers, setRoomPlayers] = useState([]);
    const [maxScoreToUse, setMaxScoreToUse] = useState(maxScore);
    const [webSocket, setWebSocket] = useState(null);
    const { myUser } = useAuth();
    const [powerUpType, setPowerUpType] = useState(null);

    useEffect(() => {
        console.log("le voila", powerUpType);
        console.log("la pos", powerUpPosition);
    }, [powerUpType, powerUpPosition]);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/pong/${roomId}`);
        
        if (myUser) {
            ws.onopen = () => {
                const powerUpBool = Boolean(powerUp);
                const maxScoreNum = Number(maxScore);
                ws.send(JSON.stringify({ action: 'set_max_score', maxScore: maxScoreNum }));
                ws.send(JSON.stringify({ name: myUser.username }));
                ws.send(JSON.stringify({ action: 'set_power_up', powerUp: powerUpBool }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.players) {
                    setRoomPlayers(data.players);
                }
                if (data.paddles_pos) {
                    setPaddlePos(data.paddles_pos);
                }
                if (data.paddle_left_height) {
                    setPaddleSizes((prev) => ({ ...prev, left: data.paddle_left_height }));
                }
                if (data.paddle_right_height) {
                    setPaddleSizes((prev) => ({ ...prev, right: data.paddle_right_height }));
                }
                if (data.ball) {
                    setBallPos(data.ball);
                }
                if (data.score) {
                    setScores(data.score);
                }
                if (data.max_score !== undefined) {
                    setMaxScoreToUse(data.max_score);
                }
                if (data.winner) {
                    setIsGameOver(true);
                    setWinner(data.winner);
                }
                if (data.status === "add" && data.power_up_position) {
                    setPowerUpPosition(data.power_up_position);
                    setPowerUpType(data.power_up);
                }
                if (data.status === "erase") {
                    setPowerUpPosition({ x: 0, y: 0 });
                    setPowerUpType(null);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed, code:', event.code);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }

        setWebSocket(ws);

        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [roomId, maxScore]);

    usePaddleMovement(webSocket, roomPlayers);

    const renderPowerUp = () => {
        switch (powerUpType) {
            case 'increase_paddle':
                return <img src="../../src/assets/game/1.svg" alt="Increase Paddle" style={{ width: '20px', height: '20px'}} />;
            case 'inversed_control':
                return <img src="../../src/assets/game/2.svg" alt="inversed control" style={{ width: '20px', height: '20px'}} />;
            default:
                return null;
        }
    };

    return (
        <div className="pong-container">
            <div className="board">
                <ScoreBoard 
                    score1={scores.player1} 
                    score2={scores.player2} 
                    maxScoreToUse={maxScoreToUse} 
                />
                {isGameOver && winner ? <WinComp winner={winner} /> : null}
                <div className="center-line"></div>
                <div className="ball" style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className="paddle paddleleft" style={{ top: `${paddlePos['left']}px`, height: `${paddleSizes.left}px` }}></div>
                <div className="paddle paddleright" style={{ top: `${paddlePos['right']}px`, height: `${paddleSizes.right}px` }}></div>
                {powerUpPosition.x !== 0 && powerUpPosition.y !== 0 && (
                    <div className="power-up" style={{ left: `${powerUpPosition.x - 30}px`, top: `${powerUpPosition.y - 30}px` }}>
                        {renderPowerUp()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PongMulti;
