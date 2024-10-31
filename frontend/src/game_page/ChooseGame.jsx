import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from '../provider/WebSocketProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/chooseGame.css';
import './css/tournament.css';
import Button from 'react-bootstrap/Button';
import "../home_page/HomeCadre.css"

const ChooseGame = () => {
    const navigate = useNavigate();
    const [maxScore, setMaxScore] = useState(10);
    const [invitedPlayer, setInvitedPlayer] = useState([]);
    const {socketUser} = useWebSocket()
    
    const [powerUp, setPowerUp] = useState(false);

    const handleSoloClick = () => {
        navigate('/globalGameSolo', { state: { maxScore, powerUp } });
    };

    const handleMultiClick = () => {
        const roomId = uuidv4();
        navigate(`/globalGameMulti/${roomId}`, { state: { maxScore, powerUp } });
    };

    const handleCreateTournaments = () => {
        const myData = {
            "type": "CREATE-TOURNAMENT"
        }
        socketUser.send(JSON.stringify(myData));
        navigate("/waitingTournaments");
    };

    const handleJoinTournaments = () => {
        return ;
    };

    const handleScoreChange = (event) => {
        setMaxScore(Number(event.target.value));
    };

    const handlePowerUp = () => {
        setPowerUp((prevPowerUp) => !prevPowerUp);
    };

    return (
        <div id="ChooseGame" className="d-flex justify-content-center align-items-center vh-100">
            <div className="row">
                <div className="col-md-4 mb-3">
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">
                                <div className="flip-card-content">
                                    <p className="title2">Solo</p>
                                    <p>Play Alone</p>
                                </div>
                            </div>
                            <div className="flip-card-back">
                                <div className="flip-card-content">
                                    <p className="title2">Settings</p>

                                    <Button
                                        type="button"
                                        variant={powerUp ? "success" : "danger"}
                                        onClick={handlePowerUp}
                                    >
                                        Power Up
                                    </Button>

                                    <div className="slider-container">
                                        <label htmlFor="maxScoreSolo">Max Score: {maxScore}</label>
                                        <input
                                            type="range"
                                            id="maxScoreSolo"
                                            name="maxScore"
                                            min="1"
                                            max="20"
                                            value={maxScore}
                                            onChange={handleScoreChange}
                                            className="form-range"
                                        />
                                    </div>
                                    <button className="start-game" onClick={handleSoloClick}>Lancer le jeu</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Carte Multi */}
                <div className="col-md-4 mb-3">
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">
                                <div className="flip-card-content">
                                    <p className="title2">Multi</p>
                                    <p>Play with Others</p>
                                </div>
                            </div>
                            <div className="flip-card-back">
                                <div className="flip-card-content">
                                    <p className="title2">Settings</p>

                                    <Button
                                        type="button"
                                        variant={powerUp ? "success" : "danger"}
                                        onClick={handlePowerUp}
                                    >
                                        Power Up
                                    </Button>

                                    <div className="slider-container">
                                        <label htmlFor="maxScoreMulti">Max Score: {maxScore}</label>
                                        <input
                                            type="range"
                                            id="maxScoreMulti"
                                            name="maxScore"
                                            min="1"
                                            max="20"
                                            value={maxScore}
                                            onChange={handleScoreChange}
                                            className="form-range"
                                        />
                                    </div>
                                    <button className="start-game" onClick={handleMultiClick}>Lancer le jeu</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Carte Tournaments */}
                <div className="col-md-4 mb-3">
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">
                                <div className="flip-card-content">
                                    <p className="title2">Tournament</p>
                                    <p>Create / Join</p>
                                </div>
                            </div>
                            <div className="flip-card-back">
                                <div className="flip-card-content">
                                    <button className="createJoinButton" onClick={() => handleCreateTournaments()}>CREATE</button>      
                                    <button className="createJoinButton" onClick={handleJoinTournaments}>JOIN</button>                                  
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChooseGame;
