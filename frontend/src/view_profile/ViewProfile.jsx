import { useEffect, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getUserMatchHistory, getUserByUsername, getUserFriendsListById } from '../api/api';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import WinLossChart from './WinLossChart';
import { getMediaUrl } from '../api/api';
import GoalChart from './GoalChart';
import './viewProfile.css';
import HistoryItem from '../components/HistoryItem';
import FriendItem from '../UsersList/FriendItem';

function ViewProfile() {
    const navigate = useNavigate();
    const [matchHistory, setMatchHistory] = useState([]);
    const { myUser } = useAuth();
    const { socketUser } = useWebSocket();
    const { username } = useParams();
    const [profileUser, setProfileUser] = useState();
    const [nbMatch, setNbMatch] = useState();
    const [friendsList, setFriendsList] = useState([]);
    const [itsFriend, setItsFriend] = useState(false);
    const [goalsConceded, setGoalsConceded] = useState(0);
    const [goalsScored, setGoalsScored] = useState(0);

    useEffect(() => {
        const handleSocketMessage = (message) => {
            const data = JSON.parse(message.data);
            console.log("data", data);

            if (data.status || data.friends || data.blocked) {
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
        console.log("matchTmp", matchTmp);
        setMatchHistory(matchTmp);
        setNbMatch(matchTmp.length);
    };

    const initMyData = async () => {
        setItsFriend(false);
        const friendsListTmp = await getUserFriendsListById(myUser.id);
        setFriendsList(friendsListTmp);
        if (friendsListTmp) {
            friendsListTmp.forEach((friend) => {
                if (friend.username === username) {
                    setItsFriend(true);
                }
            });

        }
    };

    const getUser = async () => {
        const tmpUser = await getUserByUsername(username);
        setProfileUser(tmpUser);
    };

    useEffect(() => {
        if (profileUser && matchHistory.length > 0) {
            calculateGoalRatio(matchHistory);
        }
    }, [profileUser, matchHistory]);

    const calculateGoalRatio = (matchHistory) => {
        console.log("matchHistory", matchHistory);
        let goalsConcededTmp = 0;
        let goalsScoredTmp = 0;
        let tmpresult;
        matchHistory.forEach((matchHistory) => {
            tmpresult = matchHistory.score.split("/");
            console.log("tmpresult", tmpresult);
            goalsScoredTmp += parseInt(tmpresult[0]);
            goalsConcededTmp += parseInt(tmpresult[1]);
        });
        setGoalsConceded(goalsConcededTmp);
        setGoalsScored(goalsScoredTmp);
        };

        const handleInvitation = () => {
            console.log("handleInvitation");
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

        const deleteFriend = (userDeleted) => {
            if (socketUser && socketUser.readyState === WebSocket.OPEN) {
                console.log("delete friend");
                const data = {
                    type: "DELETE",
                    userWhoDelete: myUser.username,
                    userDeleted: userDeleted.username,
                    parse: myUser.username + "|" + userDeleted.username
                };
                socketUser.send(JSON.stringify(data));
            } else {
                console.log("WebSocket for invitations is not open");
            }
        };

        const handlePlay = (user) => {
            console.log("handlePlay");
            navigate("/game/options", { state: { user } });
            return;
        }

        const statusColor = {
            "online": "#B8F2E6",
            "offline": "#FFA69E",
            "in-game": "#cdb4db"
        };

        if (!profileUser || !matchHistory) {
            return (
                <div id="background-container">
                    <div className="loader"></div>
                </div>
            );
        }

        return (
            <div className="view-profile">
                <div className="matchHistory-profile">
                    <div className="card">

                        <div className="shine"></div>
                        <div className="banner">
                            
                            <img
                                src={getMediaUrl(profileUser.profilePicture)}
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
                            {!itsFriend ? (
                                <button onClick={handleInvitation} className="invite-button">
                                    <i className="bi bi-person-plus"></i> ADD
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => deleteFriend(profileUser)} className="invite-button">
                                        <i className="bi bi-trash3 "></i> DELETE
                                    </button>
                                    <button onClick={() => handlePlay(profileUser)} className="invite-button">
                                        <i className="bi bi-controller"></i> PLAY
                                    </button>
                                </>
                            )}
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
                                    <div className="chart-stick"><GoalChart goalsConceded={goalsConceded} goalsScored={goalsScored} /></div>
                                </div>
                            )}
                        </div>
                        <div className="matchHistory-content-profile3">
                        <div className={`matchHistory-content-history ${matchHistory.length >= 4 ? "scrollable" : ""}`}>
                            {matchHistory.length === 0 ? (
                                <div className="history-info-profile">
                                    {username} has not played a match
                                </div>
                            ) : (
                                matchHistory.slice().reverse().map((match) => (
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
            </div >
        );
    }

    export default ViewProfile;
