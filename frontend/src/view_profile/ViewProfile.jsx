import { useEffect, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getUserMatchHistory } from '../api/api';
import { getUserByUsername } from '../api/api';
import { useParams } from 'react-router-dom';
import WinLossChart from './WinLossChart';
import './viewProfile.css';
import HistoryProfileItem from './HistoryProfileItem';

function ViewProfile() {
    const [matchHistory, setMatchHistory] = useState([]);
    const { myUser } = useAuth();
    const { socketUser } = useWebSocket();
    const { username } = useParams();
    const [profileUser, setProfileUser] = useState();

    useEffect(() => {
        initMyMatchs();
        getUser();
    }, [myUser.username]);

    const initMyMatchs = async () => {
        const matchTmp = await getUserMatchHistory(username);
        setMatchHistory(matchTmp);
        console.log(matchTmp);
    };

    const getUser = async () => {
        const tmpUser = await getUserByUsername(username);
        setProfileUser(tmpUser);
        console.log("mon user ; ", tmpUser);
    };

    if (!profileUser) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="view-profile">
            <div className="matchHistory-profile">
                <div className="card">
                    <div className="banner">
                        <img
                            src={profileUser.profilePicture}
                            alt="Profile Banner"
                            className="banner-image"
                        />
                    </div>

                    <div
                        className="margin-card">
                    </div>
                    <p className="name">{profileUser.username}</p>
                    <div className="actions">
                        <div class="follow-info">
                            <h2><a href="#"><span>12</span><small>friends</small></a></h2>
                            <h2><a href="#"><span>1000</span><small>Following</small></a></h2>
                        </div>
                        <div className="follow-btn"><button>Follow</button></div>
                    </div>
                    <div className="desc">Morgan has collected ants since they were six years old and now has many dozen ants but none in their pants.</div>
                </div>
                <div className="matchHistory-container">
                    <div className="matchHistory-content-profile2">
                        {matchHistory.length !== 0 && (
                            <WinLossChart matchHistory={matchHistory} />
                        )}
                    </div>
                    {/* <div className={`matchHistory-content-profile2 ${matchHistory.length >= 2 ? "scrollable" : ""}`}> */}
                    <div className="matchHistory-content-profile3">
                        {matchHistory.length === 0 && (
                            <div className="history-info-profile">
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
        </div>
    );
}

export default ViewProfile;
