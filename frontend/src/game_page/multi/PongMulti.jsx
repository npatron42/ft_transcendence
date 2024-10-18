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
                webSocket.send(JSON.stringify({ action: 'paddleup'}));
            }
            if (keysPressed['s'] || keysPressed['S']) {
                webSocket.send(JSON.stringify({ action: 'paddledown'}));
            }
            if (keysPressed['ArrowUp']) {
                webSocket.send(JSON.stringify({ action: 'paddleup'}));
            }
            if (keysPressed['ArrowDown']) {
                webSocket.send(JSON.stringify({ action: 'paddledown'}));
            }
        }, 11);

        return () => clearInterval(interval);
    }, [keysPressed, webSocket]);
};


const PongMulti = ({ roomId, maxScore, powerUp }) => {
    const [paddleLeftPos, setPaddleLeftPos] = useState(300);
    const [paddleRightPos, setPaddleRightPos] = useState(300);
    const [ballPos, setBallPos] = useState({ x: 450, y: 300 });
    const [webSocket, setWebSocket] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [roomPlayers, setRoomPlayers] = useState([]);
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [maxScoreToUse, setMaxScoreToUse] = useState(maxScore);
    const { myUser } = useAuth();
    const [powerUpOption, setPowerUpOption] = useState(false);
    const [powerUpY, setPowerUpY] = useState(0);
    const [powerUpX, setPowerUpX] = useState(0);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/pong/${roomId}`);
    
        if (myUser) {
            ws.onopen = () => {
                const powerUpBool = Boolean(powerUp)
                const maxScoreNum = Number(maxScore);
                console.log(myUser);
                console.log("Poer up : ", powerUp);
                console.log('WebSocket connecté à la room:', roomId);
                ws.send(JSON.stringify({ action: 'set_max_score', maxScore: maxScoreNum }));
                ws.send(JSON.stringify({ name: myUser.username }));
                ws.send(JSON.stringify({ action: 'set_power_up', powerUp: powerUpBool }));
            };
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // console.log("data recue front : ", data);

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
                }
                if (data.max_score !== undefined) {
                    setMaxScoreToUse(data.max_score);
                }

                if (data.winner) {
                    setIsGameOver(true);
                    setWinner(data.winner);
                    console.log(`winner is ${data.winner}`);
                }
                if (data.power_up)
                {
                    setPowerUpOption(Boolean(data.power_up));
                }
                if (data.power_up_position)
                {
                    console.log (data.power_up_position);
                    setPowerUpX(data.power_up_position.x);
                    setPowerUpY(data.power_up_position.y);
                    console.log ("voici le x : ", powerUpX);
                    console.log ("voici le y : ", powerUpY);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket fermé, code :', event.code);
            };

            ws.onerror = (error) => {
                console.error('Erreur WebbalGameMulti/a2ff89a8-ff76-4128-8deb-114108418c63Socket :', error);
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

    return (
        <div className="pong-container">
            <div className="board">
                <ScoreBoard score1={score1} score2={score2} maxScoreToUse={maxScoreToUse} />
                {isGameOver && winner ? <WinComp winner={winner} /> : null}
                <div className="center-line"></div>
                <div className="ball" style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className="paddle paddleleft" style={{ top: `${paddleLeftPos}px` }}></div>
                <div className="paddle paddleright" style={{ top: `${paddleRightPos}px` }}></div>
            </div>
        </div>
    );
};


export default PongMulti;
