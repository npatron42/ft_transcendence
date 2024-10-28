import { useEffect, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getUserMatchHistory } from '../api/api';
import { useParams } from 'react-router-dom';
import WinLossChart from './WinLossChart';
import './viewProfile.css';
import HistoryProfileItem from './HistoryProfileItem';

function ViewProfile() {
    const [matchHistory, setMatchHistory] = useState([]);
    const { myUser } = useAuth();
    const { socketUser } = useWebSocket();
    const { username } = useParams();

    useEffect(() => {
        initMyMatchs();
    }, [myUser.username]);

    const initMyMatchs = async () => {
        const matchTmp = await getUserMatchHistory(username);
        setMatchHistory(matchTmp);
        console.log(matchTmp);
    };

    return (
        <div className="viewProfile">
            <div className="matchHistoryProfile">
                <div className="matchHistory-headerProfile">
                    <span className="writeHistoryProfile">{username} </span>
                </div>
                {matchHistory.length !== 0 && (
                <WinLossChart matchHistory={matchHistory} />)}
                <div className={`matchHistory-content ${matchHistory.length >= 2 ? "scrollable" : ""}`}>
                    {matchHistory.length === 0 && (
                        <div className="historyInfoProfile">
                            {username} has not played a match
                        </div>
                    )}
                    {matchHistory.length !== 0 && (
                        matchHistory.map((match) => (
                            <HistoryProfileItem
                                key={match.id}
                                match={match}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ViewProfile;
