import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useTournamentSocket } from '../provider/TournamentSocketProvider';
import { TournamentSocketProvider } from '../provider/TournamentSocketProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/chooseGame.css';
import './css/tournament.css';
import Button from 'react-bootstrap/Button';
import ShowTournaments from '../components/showTournaments';
import "../home_page/HomeCadre.css"
import NavbarBS from '../components/Navbar';
import { useTranslation } from 'react-i18next';

const ChooseGame = () => {
    const [joinIsClicked, setJoinIsClicked] = useState(true)
    const navigate = useNavigate();
    const [maxScore, setMaxScore] = useState(10);
    const { tournamentSocket } = useTournamentSocket();
    const idTournament = uuidv4();
    const isTournament = false
    const [powerUp, setPowerUp] = useState(false);
    const { t } = useTranslation();

    const handleSoloClick = () => {
        const roomId = uuidv4();
        navigate(`/globalGameSolo/${roomId}`, { state: { maxScore, powerUp } });
    };

    const handleMultiClick = () => {
        const roomId = uuidv4();
        const mustInvite = true;
        navigate(`/globalGameMulti/${roomId}`, { state: { maxScore, powerUp, isTournament, mustInvite } });
    };

    const handleCreateTournaments = () => {
        const myData = {
            "type": "CREATE-TOURNAMENT",
            "idTournament": idTournament
        }
        tournamentSocket.send(JSON.stringify(myData));
        navigate("/waitingTournaments", { state: { idTournament } });
    };

    const handleJoinButton = () => {
        const myData = {
            "type": "SHOW-TOURNAMENTS",
        }
        tournamentSocket.send(JSON.stringify(myData));
        setJoinIsClicked(!joinIsClicked);
        return;
    }

    const handleScoreChange = (event) => {
        setMaxScore(Number(event.target.value));
    };

    const handlePowerUp = () => {
        setPowerUp((prevPowerUp) => !prevPowerUp);
    };
    return (
        <div id="ChooseGame">
            {joinIsClicked === true && (
                <div className="rowContainer">
                    <div className="col-md-4 mb-3">
                        <div className="flip-card">
                            <div className="flip-card-inner">
                                <div className="flip-card-front">
                                    <div className="flip-card-content">
                                        <p className="title2">{t('chooseGame.soloTitle')}</p>
                                        <p>{t('chooseGame.soloDesc')}</p>
                                    </div>
                                </div>
                                <div className="flip-card-back">
                                    <div className="flip-card-content">
                                        <p className="title2">{t('chooseGame.settings')}</p>

                                        <Button
                                            type="button"
                                            variant={powerUp ? "success" : "danger"}
                                            onClick={handlePowerUp}
                                        >
                                            {t('chooseGame.powerUp')}
                                        </Button>

                                        <div className="slider-container">
                                            <label htmlFor="maxScoreSolo">{t('chooseGame.scoreMax')} {maxScore}</label>
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
                                        <button className="createJoinButton" onClick={handleSoloClick}>{t('chooseGame.start')}</button>
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
                                        <p className="title2">{t('chooseGame.multiTitle')}</p>
                                        <p>{t('chooseGame.multiDesc')}</p>
                                    </div>
                                </div>
                                <div className="flip-card-back">
                                    <div className="flip-card-content">
                                    <p className="title2">{t('chooseGame.settings')}</p>

                                        <Button
                                            type="button"
                                            variant={powerUp ? "success" : "danger"}
                                            onClick={handlePowerUp}
                                        >
                                            {t('chooseGame.powerUp')}
                                        </Button>

                                        <div className="slider-container">
                                            <label htmlFor="maxScoreMulti">{t('chooseGame.scoreMax')} {maxScore}</label>
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
                                        <button className="createJoinButton" onClick={handleMultiClick}>{t('chooseGame.start')}</button>
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
                                        <p className="title2">{t('chooseGame.tournoiTitle')}</p>
                                        <p>{t('chooseGame.tournoiDesc')}</p>
                                    </div>
                                </div>
                                <div className="flip-card-back">
                                    <div className="flip-card-content">
                                        <button className="createJoinButton" onClick={() => handleCreateTournaments()}>{t('chooseGame.tournoiCreate')}</button>
                                        <button className="createJoinButton" onClick={() => handleJoinButton()}>{t('chooseGame.tournoiJoin')}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {joinIsClicked === false && (
                <ShowTournaments />
            )}
            {joinIsClicked === true && (
            <div className="settings-container">
                <button className="createJoinButton" onClick={() => navigate('/game-settings')}>{t('chooseGame.settings')}</button>
            </div>
            )}
        </div>
    );
};

export default ChooseGame;
