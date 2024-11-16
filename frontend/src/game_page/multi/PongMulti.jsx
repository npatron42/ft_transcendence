import React, { useState, useEffect } from 'react';
import '../css/game.css';
import { WinComp } from '../WinComp';
import { ScoreBoard } from '../ScoreBoard';
import { useAuth } from '../../provider/UserAuthProvider';
import { useRef } from 'react';
import { getGameSettings } from '../../api/api';

const getBoardBackground = (boardSkin) => {
    switch (boardSkin) {
        case 'defaultBoard':
            return { background: "radial-gradient(circle, #5E6472 0%, #24272c 100%)" };
        case 'oldBoard':
            return { background: "black" };
        case 'pingPongBoard':
            return { background: "#008000" };
        case 'npatronBoard':
            return {
                backgroundImage: 'url("../../assets/game/npatron.png")',
                backgroundSize: 'cover',
            };
        default:
            return { background: "radial-gradient(circle, #5E6472 0%, #24272c 100%)" };
    }
};


const usePaddleMovement = (webSocket, playerId) => {
    const [keysPressed, setKeysPressed] = useState({})

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

const PongMulti = ({ roomId, maxScore, powerUp, userSelected }) => {
    const myJwt = localStorage.getItem('jwt');
    const [webSocket, setWebSocket] = useState(null);
    const { myUser } = useAuth();
    const [gameSettings, setGameSettings] = useState();
    const [keyBind, setKeyBind] = useState({ up: "w", down: "s" });
    const [boardBackground, setBoardBackground] = useState({
        background: "black"
    });

    // Game state
    const [paddlePos, setPaddlePos] = useState({ left: 300, right: 300 });
    const [paddleSizes, setPaddleSizes] = useState({ left: 90, right: 90 });
    const [ballPos, setBallPos] = useState({ x: 450, y: 300 });
    const [scores, setScores] = useState({ player1: 0, player2: 0 });
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [roomPlayers, setRoomPlayers] = useState([]);
    const [maxScoreToUse, setMaxScoreToUse] = useState(maxScore);

    // Power Up gestion
    const [powerUpType, setPowerUpType] = useState(null);
    const [powerUpPosition, setPowerUpPosition] = useState({ x: 0, y: 0 });
    const [displayPowerUpBool, setDisplayPowerUpBool] = useState(false);
    const [boardClass, setBoardClass] = useState('board');
    const [powerUpClass, setPowerUpClass] = useState(null);
    const [playerHasPowerUp, setPlayerHasPowerUp] = useState(null);
    const [soloPlayActive, setSoloPlayActive] = useState(false);
    const [centerLineClass, setCenterLineClass] = useState('center-line');

    useEffect(() => {
        console.log("le voila", powerUpType);
        console.log("la pos", powerUpPosition);
    }, [powerUpType, powerUpPosition]);

    // Fetch game settings
    useEffect(() => {
        (async () => {
            try {
                const settings = await getGameSettings();
                setGameSettings(settings);
                setKeyBind({ up: settings.up, down: settings.down });
                const tmpBoard = getBoardBackground(settings.boardSkin);
                setBoardBackground(tmpBoard);
                console.log("Settings récupérés :", settings);
            } catch (error) {
                console.error("Erreur :", error);
            }
        })();
    }, []);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/pong/${roomId}/?token=${myJwt}`);

        if (myUser) {
            ws.onopen = () => {
                const powerUpBool = Boolean(powerUp);
                const maxScoreNum = Number(maxScore);
                ws.send(JSON.stringify({ action: 'set_max_score', maxScore: maxScoreNum }));
                ws.send(JSON.stringify({ name: myUser.username }));
                ws.send(JSON.stringify({ action: 'set_power_up', powerUp: powerUpBool }));
                if (userSelected) {
                    ws.send(JSON.stringify({ userSelected: userSelected.username }));
                }
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (!data.players) {
                    console.log('Received:', data);
                }
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
                if (data.power_up) {
                    setPowerUpType(data.power_up);
                    if (data.power_up === 'increase_paddle' || data.power_up === 'x2') {
                        console.log ("power up class", powerUpClass);
                        setPowerUpClass('power-up-bonus');
                    }
                    else {
                        setPowerUpClass('power-up-malus');
                    }
                }
                if (data.status === "add" && data.power_up_position) {
                    setPowerUpPosition(data.power_up_position);
                    console.log("power up type", data.power_up);
                }

                if (data.status === "erase") {
                    setPowerUpPosition({ x: 0, y: 0 });
                    setPowerUpType(null);
                }
                if (data.status === "keeped") {
                    setDisplayPowerUpBool(true);
                    setPowerUpPosition({ x: 0, y: 0 });
                }
                if (data.power_up_release) {
                    console.log("power up release voici ;e bool", displayPowerUpBool);
                    setDisplayPowerUpBool(false);
                    setPowerUpType(null);
                    setCenterLineClass('center-line');
                }
                if (data.player_has_power_up) {
                    console.log("player has power up", data.player_has_power_up);
                    setPlayerHasPowerUp(data.player_has_power_up);
                }
                if (data.solo_play_active) {
                    setSoloPlayActive(true);
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
                return <img src="../../src/assets/game/increase_paddle.svg" alt="Increase Paddle" style={{ width: '40px', height: '40px' }} />;
            case 'inversed_control':
                return <img src="../../src/assets/game/inversed_control.svg" alt="inversed control" style={{ width: '40px', height: '40px' }} />;
            case 'decrease_paddle':
                return <img src="../../src/assets/game/decrease_paddle.svg" alt="inversed control" style={{ width: '40px', height: '40px' }} />;
            case 'x2':
                return <img src="../../src/assets/game/x2.svg" alt="inversed control" style={{ width: '40px', height: '40px' }} />;
            case 'solo_play': 
                return <img src="../../src/assets/game/solo_play.svg" alt="solo play" style={{ width: '40px', height: '40px' }} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        console.log("pif le powr", playerHasPowerUp);
        console.log("paf le bool", displayPowerUpBool);
        if (displayPowerUpBool && playerHasPowerUp == myUser.username) {
            setBoardClass('board-bonus');
        }
        else if (displayPowerUpBool && playerHasPowerUp !== myUser.username) {
            setBoardClass('board-malus');
        }
        else {
            setBoardClass('board');
        }
    }, [displayPowerUpBool, playerHasPowerUp]);

    useEffect(() => {
        if (powerUpType === 'solo_play') {
            if (soloPlayActive) {
                setCenterLineClass('center-line-solo');
            }
            else {
                setCenterLineClass('center-line');
            }
        }
    }, [soloPlayActive, powerUpType]);

    if (!gameSettings) {
        return <div>Loading...</div>;
    }


    return (
        <div className="pong-container">
            <div className={boardClass} style={boardBackground}>
                <ScoreBoard
                    score1={scores.player1}
                    score2={scores.player2}
                    maxScoreToUse={maxScoreToUse}
                />
                {isGameOver && winner ? <WinComp winner={winner} /> : null}
                <div className={centerLineClass}></div>
                <div className={gameSettings.ballSkin + "Pong"} style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}></div>
                <div className={gameSettings.paddleSkin + "Pong"} style={{ top: `${paddlePos['left']}px`, height: `${paddleSizes.left}px`, left : '10px' }}></div>
                <div className={gameSettings.paddleSkin + "Pong"} style={{ top: `${paddlePos['right']}px`, height: `${paddleSizes.right}px`, right :'10px' }}></div>
                {/* <div className="direction-line" style={{
                    left: `${ballPos.x}px`,
                    top: `${ballPos.y}px`,
                    transform: `rotate(${10}deg)`,
                    width: `${length}px`
                }}></div> */}
                {powerUpPosition.x !== 0 && powerUpPosition.y !== 0 && (
                    <div className={powerUpClass} style={{ left: `${powerUpPosition.x - 20}px`, top: `${powerUpPosition.y - 20}px` }}>
                        {renderPowerUp()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PongMulti;
