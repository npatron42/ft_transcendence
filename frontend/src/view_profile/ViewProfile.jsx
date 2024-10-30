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
    const [nbMatch, setNbMatch] = useState();

    useEffect(() => {
        initMyMatchs();
        getUser();
    }, [myUser.username]);

    const initMyMatchs = async () => {
        const matchTmp = await getUserMatchHistory(username);
        setMatchHistory(matchTmp);
        setNbMatch(matchTmp.length);
        console.log("nombre de match", nbMatch);
        console.log("la", matchTmp.length);
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
                    <div className="shine"></div>

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
                    <div class="follow-info row">
                        <div class="col-md-6">
                            <p class="info-profile">Match played: {nbMatch}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="info-profile">Friends: {nbMatch}</p>
                        </div>
                    </div>
                    <div className="follow-btn"><button>Follow</button></div>
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
