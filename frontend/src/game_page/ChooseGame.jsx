import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/chooseGame.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const ChooseGame = () => {
    const navigate = useNavigate();
    const [maxScore, setMaxScore] = useState(10);

    const handleSoloClick = () => {
        navigate('/GlobalGameSolo');
    };

    const handleMultiClick = () => {
        const roomId = uuidv4();
        navigate(`/GlobalGameMulti/${roomId}`, { state: { maxScore } });
    };

    const handleScoreChange = (event) => {
        setMaxScore(event.target.value);
    };

    return (
        <div id="ChooseGame">
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
                            <button className="Powerup">Power Up</button>
                            <button className="IA">Versus IA</button>
                            <div className="slider-container">
                                <label htmlFor="maxScore">Max Score: {maxScore}</label>
                                <input 
                                    type="range" 
                                    id="maxScore" 
                                    name="maxScore" 
                                    min="1" 
                                    max="20" 
                                    value={maxScore} 
                                    onChange={handleScoreChange} 
                                />
                            </div>
                            <button className="start-game" onClick={handleSoloClick}>Lancer le jeu</button>
                        </div>
                    </div>
                </div>
            </div>
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
                            <button className="Powerup">Power Up</button>
                            <div className="slider-container">
                                <label htmlFor="maxScore">Max Score: {maxScore}</label>
                                <input 
                                    type="range" 
                                    id="maxScore" 
                                    name="maxScore" 
                                    min="1" 
                                    max="20" 
                                    value={maxScore} 
                                    onChange={handleScoreChange} 
                                />
                            </div>
                            <button className="start-game" onClick={handleMultiClick}>Lancer le jeu</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChooseGame;
