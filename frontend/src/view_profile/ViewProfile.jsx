import { useEffect, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getUserMatchHistory, getUserByUsername, getUserFriendsListById } from '../api/api';
import { useParams } from 'react-router-dom';
import WinLossChart from './WinLossChart';
import GoalChart from './GoalChart';
import './viewProfile.css';
import HistoryItem from '../components/HistoryItem';

function ViewProfile() {
    const [matchHistory, setMatchHistory] = useState([]);
    const { myUser } = useAuth();
    const { socketUser } = useWebSocket();
    const { username } = useParams();
    const [profileUser, setProfileUser] = useState();
    const [nbMatch, setNbMatch] = useState();
    const [friendsList, setFriendsList] = useState([]);

    useEffect(() => {
        const handleSocketMessage = (message) => {
            const data = JSON.parse(message.data);
            console.log("data", data);

            if (data.status || data.friends) {
                getUser();
                initMyData();
            }
        };

        if (socketUser) {
            socketUser.addEventListener('message', handleSocketMessage);
        }

        getUser();
        initMyData();
        initMyMatch();
        console.log("je passe ici ", myUser.id);

        return () => {
            if (socketUser) {
                socketUser.removeEventListener('message', handleSocketMessage);
            }
        };
    }, [socketUser]);


    const initMyMatch = async () => {
        const matchTmp = await getUserMatchHistory(username);
        setMatchHistory(matchTmp);
        setNbMatch(matchTmp.length);
    };

    const initMyData = async () => {
        const friendsListTmp = await getUserFriendsListById(myUser.id);
        setFriendsList(friendsListTmp);
    };

    const getUser = async () => {
        const tmpUser = await getUserByUsername(username);
        setProfileUser(tmpUser);
    };

    const handleInvitation = () => {
        if (socketUser && socketUser.readyState === WebSocket.OPEN) {
            const data = {
                type: "INVITE",
                invitationFrom: myUser.username,
                to: profileUser.username,
                parse: myUser.username + "|" + profileUser.username
            };
            socketUser.send(JSON.stringify(data));
        } else {
            console.log("WebSocket for invitations is not open");
        }
    };

    const statusColor = {
        "online": "#B8F2E6",
        "offline": "#FFA69E",
        "in-game": "#D9F3E2"
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
                    <div className="follow-info row">
                        <div className="col-md-6">
                            <p className="info-profile">Match : {nbMatch}</p>
                        </div>
                        <div className="col-md-6">
                            <p className="info-profile">Tournament : {nbMatch}</p>
                        </div>
                        <div className="col-md-6">
                            <p className="info-profile">Friends : {friendsList.length}</p>
                        </div>
                        <div className="col-md-6">
                            <p className="info-profile" style={{ color: statusColor[profileUser.status] || "white" }}
                            > Status : {profileUser.status} </p>
                        </div>
                    </div>
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
                            <div className="chart-container">
                                <div className="chart-circle"><WinLossChart matchHistory={matchHistory} /></div>
                                <div className="chart-stick"><GoalChart goalsConceded={12} goalsScored={15} /></div>
                            </div>
                        )}
                    </div>

                    <div className={`matchHistory-content-profile3 ${matchHistory.length >= 4 ? "scrollable" : ""}`}>
                        {matchHistory.length === 0 ? (
                            <div className="history-info-profile">
                                {username} has not played a match
                            </div>
                        ) : (
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
        </div>
    );
}

export default ViewProfile;
