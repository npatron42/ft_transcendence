import { useEffect, useRef, useState } from 'react';
import "./matchHistory.css"
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getMatchHistory } from '../api/api';
import HistoryItem from './HistoryItem';

function MatchHistory() {

	const [matchHistory, setMatchHistory] = useState([]);
	const {myUser} = useAuth();
	const {socketUser} = useWebSocket();

    useEffect(() => {
        initMyMatchs();
    },[myUser])

	const initMyMatchs = async () => {
		const matchTmp = await getMatchHistory();
		setMatchHistory(matchTmp);
	}

	return (
		<div className="matchHistory">
			<div className="matchHistory-header">
				<span className="writeHistory"> My Match History</span>
			</div>
			<div className={`matchHistory-content ${matchHistory.length >= 3 ? "scrollable" : ""}`}>
				{matchHistory.length === 0 && (
					<div className="historyInfo">
						Play some matches to have history!
					</div>
				)}
				{matchHistory.length !== 0 && (
					matchHistory.slice().reverse().map((match) => (
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

export default MatchHistory;