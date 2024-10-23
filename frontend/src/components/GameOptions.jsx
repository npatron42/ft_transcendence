import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';


function GameOptions() {

	const {socketUser} = useWebSocket();
	const {myUser} = useAuth();
    const location = useLocation();
    const userSelected = location.state?.user

    const navigate = useNavigate();
    const [maxScore, setMaxScore] = useState(10);
    const [invitedPlayer, setInvitedPlayer] = useState([]);
    
    const handleMultiClick = () => {
        const roomId = uuidv4();
        navigate(`/globalGameMulti/${roomId}`, { state: { maxScore } });
		const dataToSend = {
			"type": "GameInvitation",
			"leader": myUser,
			"userInvited": userSelected,
		}
		socketUser.send(JSON.stringify(dataToSend));
		return ;
    };

    const handleScoreChange = (event) => {
        setMaxScore(Number(event.target.value));
    };
	
    return (
		<div id="background-container">
				<div className="flip-card">
					<div className="flip-card-inner">
						<div className="flip-card-front">
							<div className="flip-card-content">
								<p className="title">Options</p>
								<p>Choose your options</p>
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
								<button className="start-game" onClick={handleMultiClick}>Invite {userSelected.username}</button>
							</div>
						</div>
					</div>
				</div>
		</div>
    );
}

export default GameOptions;