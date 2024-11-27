import React, { useEffect, useState, useRef } from 'react';
import { getUsersList, getFriendsList, getAllUsers } from '../api/api';
import FriendItem from './FriendItem';
import UserItem from './UserItem';
import Loading from '../loading_page/Loading';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { useTranslation } from 'react-i18next';

const UsersFriendsList = () => {

    const { socketUser, subscribeToMessages, subscribeToStatus, subscribeToNotifs} = useWebSocket();

    const {myUser} = useAuth()
    const [socketMessage, setSocketMessage] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [activeList, setActiveList] = useState('users');
    const { t } = useTranslation();
    let i = 0;

    useEffect(() => {
        const handleSocketUser = (data) => {
            if (data["friends"]) {
                setFriendsList(data["friends"]);
            }
            if (data["AllUsers"]) {
                setUsersList(data["AllUsers"]);
            }
        };

        const handleStatus = (data) => {
            setSocketMessage(data["status"]);
        }

        const unsubscribeMess = subscribeToMessages(handleSocketUser);
        const unsubscribeStatus = subscribeToStatus(handleStatus);

        return () => {

            unsubscribeMess();
            unsubscribeStatus();

        };

    }, [subscribeToMessages, subscribeToStatus, socketUser]);


    const defineAllUsersStatus = async () => {
        const allUsers = await getAllUsers();
        const myResult = []
        for (let i = 0; i < allUsers.length; i++) {
            const username = allUsers[i].username;
            const hisStatus = allUsers[i].status;
            const id = allUsers[i].id;
            let hisStatusTmp;

            if (hisStatus === "online")
                hisStatusTmp = true
            else if (hisStatus === "in-game")
                hisStatusTmp = "in-game"
            else
                hisStatusTmp = false
            myResult[id] = hisStatusTmp;
        }
        setSocketMessage(myResult);
    }

    const initMyLists = async () => {

        const myUsersList = await getUsersList();
        const myFriendsList = await getFriendsList();

        setFriendsList(myFriendsList);
        setUsersList(myUsersList);
        await defineAllUsersStatus();
    };

    useEffect(() => {
        setIsLoading(true)
        initMyLists();
        setIsLoading(false)

    },[])
    
    const showUsersList = () => {
        setActiveList('users');
    }
    const showFriendsList = () => {
        setActiveList('friends');
    }

    const handleInvitation = (userInvited) => {
        if (socketUser && socketUser.readyState === WebSocket.OPEN) {
            setIsInviting(true);
            const data = {
                type: "INVITE",
                invitationFrom: myUser.id,
                to: userInvited.id,
                parse: myUser.id + "|" + userInvited.id
            };
            socketUser.send(JSON.stringify(data));
            setIsInviting(false);
        } else {
            console.log("WebSocket for invitations is not open");
        }
    };
    
    const deleteFriend = (userDeleted) => {
        if (socketUser && socketUser.readyState === WebSocket.OPEN) {
            const data = {
                type: "DELETE",
                userWhoDelete: myUser.id,
                userDeleted: userDeleted.id,
                parse: myUser.id + "|" + userDeleted.id
            };
            socketUser.send(JSON.stringify(data));
        } else {
            console.log("WebSocket for invitations is not open");
        }
    };

    const chooseStatus = (id) => {
        if (socketMessage[id] === true)
            return ("online")
        else if (socketMessage[id] === "in-game")
            return ("in-game")
        return ("offline")
    };

    return (
        <div className="friends-list">
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <div className="center-container">
                        {activeList === 'users' ? (
                            <div>
                                <h4 type="button" className="btn btn-outline-dark nameUserComponent-active" onClick={showUsersList}>
                                    <i className="bi bi-people-fill"></i>
                                </h4>
                                <h4 type="button" className="btn btn-outline-dark nameFriendComponent" onClick={showFriendsList}>
                                    <i className="bi bi-person-hearts"></i>
                                </h4>
                            </div>
                        ) : (
                            <div>
                                <h4 type="button" className="btn btn-outline-dark nameUserComponent" onClick={showUsersList}>
                                    <i className="bi bi-people-fill"></i>
                                </h4>
                                <h4 type="button" className="btn btn-outline-dark nameFriendComponent-active" onClick={showFriendsList}>
                                    <i className="bi bi-person-hearts"></i>
                                </h4>
                            </div>
                        )}
                    </div>
                    
                    {activeList === 'users' ? (
                        <div className={`userslist ${usersList.length > 0 ? 'scroll' : ''}`}>
                            {Array.isArray(usersList) ? (
                                usersList.length === 0 ? (
                                    <div className="noUsers">{t('history.noUser')}</div>
                                ) : (
                                    <table>
                                        <tbody>
                                            {usersList.map((user) => (
                                                <UserItem 
                                                    key={i++} 
                                                    user={user} 
                                                    handleInvitation={handleInvitation} 
                                                    isInviting={isInviting}
                                                    chooseStatus={chooseStatus}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            ) : (
                                <table>
                                    <tbody>
                                        <tr>
                                            <td colSpan="4" className="noUsers"> {t('history.invalidUserList')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <div className={`userslist ${usersList.length > 0 ? 'scroll' : ''}`}>
                            {Array.isArray(friendsList) ? (
                                friendsList.length === 0 ? (
                                    <div className="noUsers">{t('history.noFriend')}</div>
                                ) : (
                                    <table>
                                        <tbody>
                                            {friendsList.map((user) => (
                                                <FriendItem 
                                                    key={i++} 
                                                    user={user} 
                                                    chooseStatus={chooseStatus}
                                                    deleteFriend={deleteFriend}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            ) : (
                                <table>
                                    <tbody>
                                        <tr>
                                            <td colSpan="4" className="noUsers">{t('history.invalidUserlist')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}    

export default UsersFriendsList;
