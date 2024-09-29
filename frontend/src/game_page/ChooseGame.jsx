import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import './css/chooseGame.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const ChooseGame = () => {
    const navigate = useNavigate();
    const [maxScore, setMaxScore] = useState(10);
    const [invitedPlayer, setInvitedPlayer] = useState([]);

    //setInvitedPlayer((prevPlayers) => [...prevPlayers, ]);


    const handleSoloClick = () => {
        navigate('/globalGameSolo', { state: { maxScore } });
    };

    const handleMultiClick = () => {
        const roomId = uuidv4();
        navigate(`/globalGameMulti/${roomId}`, { state: { maxScore } });
    };

    const handleTournamentsClick = () => {
        navigate('/globalTournaments', {state: { invitedPlayer, maxScore }});
    }

    const handleScoreChange = (event) => {
        setMaxScore(Number(event.target.value));
    };

    return (
        <div id="ChooseGame" className="d-flex justify-content-center align-items-center vh-100">
            <div className="row">
                <div className="col-md-4 mb-3">
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">
                                <div className="flip-card-content">
                                    <p className="title">Solo</p>
                                    <p>Play Alone</p>
                                </div>
                            </div>
                            <div className="flip-card-back">
                                <div className="flip-card-content">
                                    <p className="title">Settings</p>
                                    <Button type="button" variant="outline-dark" >Power Up</Button>
                                    <Button type="button" variant="outline-dark" >VS IA</Button>
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
                                    <p className="title">Multi</p>
                                    <p>Play with Others</p>
                                </div>
                            </div>
                            <div className="flip-card-back">
                                <div className="flip-card-content">
                                    <p className="title">Settings</p>
                                    <button className="btn btn-primary mb-2">Power Up</button>
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
                                    <p className="title">Tournament</p>
                                    <p>Create a Tournament</p>
                                </div>
                            </div>
                            <div className="flip-card-back">
                                <div className="flip-card-content">
                                    <p className="title">Settings</p>
                                    <button className="btn btn-primary mb-2">Power Up</button>
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
                                    <button className="start-game" onClick={handleTournamentsClick}>Lancer le jeu</button>
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
