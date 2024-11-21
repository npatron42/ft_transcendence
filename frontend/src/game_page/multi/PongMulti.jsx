import React, { useState, useEffect } from 'react';
import '../css/game.css';
import { WinComp } from '../WinComp';
import { ScoreBoard } from '../ScoreBoard';
import { useAuth } from '../../provider/UserAuthProvider';
import { useNavigate} from 'react-router-dom'
import { useTournamentSocket } from '../../provider/TournamentSocketProvider';
const host = import.meta.env.VITE_HOST;

const usePaddleMovement = (webSocket, playerId) => {
    const [keysPressed, setKeysPressed] = useState({})

    useEffect(() => {
        if (!webSocket) return;

        const handleKeyDown = (e) => {
            setKeysPressed((prev) => ({ ...prev, [e.key]: true }));
        };

        const handleKeyUp = (e) => {
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

const PongMulti = ({ roomId, maxScore, powerUp, userSelected, isTournament, idTournament }) => {
    const myJwt = localStorage.getItem('jwt');
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
    const [idTournament2, setIdTournament2] = useState(undefined)
    const { myUser } = useAuth();
    const [powerUpType, setPowerUpType] = useState(null);
    const navigate = useNavigate();
    const { tournamentSocket, subscribeToTournaments } = useTournamentSocket();

    useEffect(() => {
    }, [powerUpType, powerUpPosition]);

    useEffect(() => {
        const ws = new WebSocket(`ws://${host}:8000/ws/pong/${roomId}/${isTournament}/${idTournament}/?token=${myJwt}`);

        if (myUser) {
            ws.onopen = () => {
                const powerUpBool = Boolean(powerUp);
                const maxScoreNum = Number(maxScore);
                ws.send(JSON.stringify({ action: 'set_max_score', maxScore: maxScoreNum }));
                ws.send(JSON.stringify({ name: myUser.username }));
                ws.send(JSON.stringify({ action: 'set_power_up', powerUp: powerUpBool }));
                if (userSelected)   
                    {
                        ws.send(JSON.stringify({userSelected: userSelected.username}));
                    }   
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
                if (data.idTournament) {
                    setIdTournament2(data.idTournament)
                }
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
                return <img src="../../src/assets/game/increase_paddle.svg" alt="Increase Paddle" style={{ width: '40px', height: '40px' }} />;
            case 'inversed_control':
                return <img src="../../src/assets/game/inversed_control.svg" alt="inversed control" style={{ width: '40px', height: '40px' }} />;
            case 'decrease_paddle':
                return <img src="../../src/assets/game/decrease_paddle.svg" alt="inversed control" style={{ width: '40px', height: '40px' }} />;
            default:
                return null;
        }
    };

    // IF TOURNAMENT --> REDIRECT TO WAITING

    const handleJoinTournament = (idTournament2) => {
        const data = {
            "type": "WANT-TO-SEE-RESULTS"
        }
        tournamentSocket.send(JSON.stringify(data))
		navigate("/waitingTournaments", { state: { idTournament2 } })
		return ;
	}

    console.log("isTournament, isGameOver", isTournament, isGameOver)

    return (
        <div className="pong-container">
            <div className="board">
                <ScoreBoard
                    score1={scores.player1}
                    score2={scores.player2}
                    maxScoreToUse={maxScoreToUse}
                />
                {isGameOver && winner ? <WinComp winner={winner} /> : null }
                <div className="center-line"></div>
                <div className="ball" style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className="paddle paddleleft" style={{ top: `${paddlePos['left']}px`, height: `${paddleSizes.left}px` }}></div>
                <div className="paddle paddleright" style={{ top: `${paddlePos['right']}px`, height: `${paddleSizes.right}px` }}></div>
                {powerUpPosition.x !== 0 && powerUpPosition.y !== 0 && (
                    <div className="power-up" style={{ left: `${powerUpPosition.x - 20}px`, top: `${powerUpPosition.y - 20}px` }}>
                        {renderPowerUp()}
                    </div>
                )}
                {isTournament === true && isGameOver === true && (
                    <div>{handleJoinTournament(idTournament2)}</div>
                )}
            </div>
        </div>
    );
};

export default PongMulti;
