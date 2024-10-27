import { useEffect, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getUserMatchHistory } from '../api/api';
import HistoryItem from '../components/HistoryItem';
import { useParams } from 'react-router-dom';
import WinLossChart from './WinLossChart';
import './viewProfile.css';

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
                    <span className="writeHistory">PROFILE DE {username} </span>
                </div>
                <WinLossChart matchHistory={matchHistory} />
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
        </div>
    );
}

export default ViewProfile;
