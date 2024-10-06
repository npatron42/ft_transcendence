import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers, getFriendsList, getNotifs } from '../api/api';  // Assurez-vous que les imports sont corrects
import FriendItem from './FriendItem';
import UserItem from './UserItem';
import Loading from '../loading_page/Loading';
import { useWebSocket } from '../provider/WebSocketProvider';
const UsersFriendsList = ({ myUser }) => {

    const { socketUser, subscribeToMessages, subscribeToStatus} = useWebSocket();

    const [socketMessage, setSocketMessage] = useState({});
    const [usersList, setUsersList] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [activeList, setActiveList] = useState('users');

    useEffect(() => {
        const handleSocketUser = (data) => {
            if (data["friends"]) {
                changeFriendsList(data);
            }
            if (data["AllUsers"]) {
                changeUsersList(data["AllUsers"], friendsList);
            }
            if (data["friendsInvitations"]) {
                console.log("socket --> ", data["friendsInvitations"]);
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

    const changeFriendsList = (data) => {
        console.log(data)
        setFriendsList(data["friends"])
    } 

    const changeUsersList = async (usersList, friendsList) => {
        const allUsers = usersList
        const filteredList = allUsers.filter(user => user.username !== myUser.username);
        const withoutFriends = [];
        for (let i = 0; i < filteredList.length; i++) {
            let isFriend = false;
            const tmpName = filteredList[i].username;
            for (let i = 0; i < friendsList.length; i++) {
                if (tmpName === friendsList[i].username) {
                    isFriend = true;
                }
            }
            if (isFriend == false)
                withoutFriends.push(filteredList[i])
        }
        setUsersList(withoutFriends);
    };

    const defineUsersList = async (friendsList) => {
        setIsLoading(true);
        const myList = await getAllUsers();
        const filteredList = myList.filter(user => user.username !== myUser.username);
        const withoutFriends = [];
        for (let i = 0; i < filteredList.length; i++) {
            let isFriend = false;
            const tmpName = filteredList[i].username;
            for (let i = 0; i < friendsList.length; i++) {
                if (tmpName === friendsList[i].username) {
                    isFriend = true;
                }
            }
            if (isFriend == false)
                withoutFriends.push(filteredList[i])
        }
        setUsersList(withoutFriends);
        setIsLoading(false);
    };

    const defineFriendsList = async () => {
        setIsLoading(true);
        const myFriendsList = await getFriendsList();
        setFriendsList(myFriendsList);
        setIsLoading(false);
        return (myFriendsList);
    };
    
    const defineAllUsersStatus = async () => {
        const allUsers = await getAllUsers();
        const myResult = {}
        for (let i = 0; i < allUsers.length; i++) {
            const username = allUsers[i].username;
            const hisStatus = allUsers[i].status;
            myResult[username] = hisStatus;
        }
        setSocketMessage(myResult);
    }

    const initMyLists = async () => {
        const myFriendsList = await defineFriendsList();
        await defineUsersList(myFriendsList);
        await defineAllUsersStatus();
    };

    useEffect(() => {
        initMyLists();
    },[myUser.username])
    

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
                invitationFrom: myUser.username,
                to: userInvited.username,
                parse: myUser.username + "|" + userInvited.username
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
                userWhoDelete: myUser.username,
                userDeleted: userDeleted.username,
                parse: myUser.username + "|" + userDeleted.username
            };
            socketUser.send(JSON.stringify(data));
        } else {
            console.log("WebSocket for invitations is not open");
        }
    };

    const chooseStatus = (username) => {
        return socketMessage[username] ? "online" : "offline";
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
                                Users
                            </h4>
                            <h4 type="button" className="btn btn-outline-dark nameFriendComponent" onClick={showFriendsList}>
                                Friends
                            </h4>
                        </div>
                        ) : (
                        <div>
                            <h4 type="button" className="btn btn-outline-dark nameUserComponent" onClick={showUsersList}>
                                Users
                            </h4>
                            <h4 type="button" className="btn btn-outline-dark nameFriendComponent-active" onClick={showFriendsList}>
                                Friends
                            </h4>
                        </div>
                        )}
                    </div>
                    {activeList === 'users' ? (
                        <div className="users-list">
                            <table className="">
                                <tbody className="bodyUsers">
                                    {Array.isArray(usersList) ? (
                                        usersList.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="noUsers">No users found</td>
                                            </tr>
                                        ) : (
                                            usersList.map((user) => (
                                                <UserItem 
                                                    key={user.id} 
                                                    user={user} 
                                                    handleInvitation={handleInvitation} 
                                                    isInviting={isInviting}
                                                    chooseStatus={chooseStatus}
                                                />
                                            ))
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="noUsers">Invalid user list</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="users-list">
                            <table className="">
                                <tbody className="bodyUsers">
                                    {Array.isArray(friendsList) ? (
                                        friendsList.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="noUsers">You don't have friends...</td>
                                            </tr>
                                        ) : (
                                            friendsList.map((user) => (
                                                <FriendItem 
                                                    key={user.id} 
                                                    user={user} 
                                                    chooseStatus={chooseStatus}
                                                    deleteFriend={deleteFriend}
                                                />
                                            ))
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="noUsers">Invalid friends list</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default UsersFriendsList;
