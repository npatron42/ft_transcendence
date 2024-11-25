import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';


function GameOptions() {

	const { socketUser } = useWebSocket();
	const { myUser } = useAuth();
	const location = useLocation();
	const userSelected = location.state?.user
	const navigate = useNavigate();
	const [maxScore, setMaxScore] = useState(10);
	const [invitedPlayer, setInvitedPlayer] = useState([]);
	const [powerUp, setPowerUp] = useState(false);
	const { t } = useTranslation();

	const handleMultiClick = () => {
		const roomId = uuidv4();
		navigate(`/globalGameMulti/${roomId}`, { state: { maxScore, powerUp, userSelected } });
		const dataToSend = {
			"type": "GameInvitation",
			"leader": myUser,
			"userInvited": userSelected,
			"roomId": roomId
		}
		socketUser.send(JSON.stringify(dataToSend));
		return;
	};

	const handleScoreChange = (event) => {
		setMaxScore(Number(event.target.value));
	};

	const handlePowerUp = () => {
		setPowerUp((prevPowerUp) => !prevPowerUp);
	};

	return (
		<div id="background-container">
			<div className="flip-card">
				<div className="flip-card-inner">
					<div className="flip-card-front">
						<div className="flip-card-content">
							<p className="title2">{t('chooseGame.options')}</p>
							<p>{t('chooseGame.chooseOption')}</p>
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
							<button className="createJoinButton" onClick={handleMultiClick}>{t('chooseGame.invite')} {userSelected.username}</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GameOptions;