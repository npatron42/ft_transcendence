import { useEffect, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getUserMatchHistory, getUserByUsername } from '../api/api';
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

    // Fonction handleInvitation pour envoyer une invitation via WebSocket
    const handleInvitation = () => {
        if (socketUser && socketUser.readyState === WebSocket.OPEN) {
            const data = {
                type: "INVITE",
                invitationFrom: myUser.username,
                to: profileUser.username,
                parse: myUser.username + "|" + profileUser.username
            };
            socketUser.send(JSON.stringify(data));
            console.log(`Invitation envoyée à ${profileUser.username}`);
        } else {
            console.log("WebSocket for invitations is not open");
        }
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

                    <div className="margin-card"></div>
                    <p className="name">{profileUser.username}</p>
                    <div className="margin-card"></div>

                    <div className="follow-info row">
                        <div className="col-md-6">
                            <p className="info-profile">Match played: {nbMatch}</p>
                        </div>
                        <div className="col-md-6">
                            <p className="info-profile">Tournament played: {nbMatch}</p>
                        </div>
                        <div className="col-md-6">
                            <p className="info-profile">Friends: {nbMatch}</p>
                        </div>
                        <div className="col-md-6">
                            <p className="info-profile">Status: online</p>
                        </div>
                    </div>

                    <div className="margin-card"></div>
                    <div className="button-container">
                    <button onClick={handleInvitation} className="invite-button">
                        <i className="bi bi-person-plus"></i> ADD
                    </button>
                    </div>
                </div>
                <div className="matchHistory-container">
                    <div className="matchHistory-content-profile2">
                        {matchHistory.length === 0 ? (
                            <div className="history-info-profile">
                                {username} has not played a match
                            </div>
                        ) : (
                            <WinLossChart matchHistory={matchHistory} />
                        )}
                    </div>
                       <div className={`matchHistory-content-profile3 ${matchHistory.length >= 4 ? "scrollable" : ""}`}>
                        {matchHistory.length === 0 ? (
                            <div className="history-info-profile">
                                {username} has not played a match
                            </div>
                        ) : (
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
