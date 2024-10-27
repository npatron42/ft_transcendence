import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getMatchHistory } from '../api/api';
import HistoryItem from '../components/HistoryItem';

function ViewProfile() {

	const [matchHistory, setMatchHistory] = useState([]);
	const {myUser} = useAuth();
	const {socketUser} = useWebSocket();

    useEffect(() => {
        initMyMatchs();

    },[myUser.username])

	const initMyMatchs = async () => {
		const matchTmp = await getMatchHistory();
		setMatchHistory(matchTmp);
		console.log(matchTmp)
	}

	return (
		<div className="matchHistory">
			<div className="matchHistory-header">
				<span className="writeHistory">Match History</span>
			</div>
			<div className={`matchHistory-content ${matchHistory.length >= 5 ? "scrollable" : ""}`}>
				{matchHistory.length === 0 && (
					<div className="historyInfo">
						Play some matches to have history!
					</div>
				)}
				{matchHistory.length !== 0 && (
					matchHistory.map((match) => (
						<HistoryItem
							key={match.id} 
							match={match} 
						/>
					))
				)}
			</div>
		</div>
	);
}

export default ViewProfile;