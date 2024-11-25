import { useEffect, useRef, useState } from 'react';
import "./matchHistory.css"
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getMatchHistory } from '../api/api';
import HistoryItem from './HistoryItem';
import { useTranslation } from 'react-i18next';

function MatchHistory() {

	const [matchHistory, setMatchHistory] = useState([]);
	const {myUser} = useAuth();
	const {socketUser} = useWebSocket();
	const { t } = useTranslation();

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
				<span className="writeHistory"> {t('history.myHistory')}</span>
			</div>
			<div className={`matchHistory-content ${matchHistory.length >= 3 ? "scrollable" : ""}`}>
				{matchHistory.length === 0 && (
					<div className="historyInfo">
						{t('history.noMatch')}
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