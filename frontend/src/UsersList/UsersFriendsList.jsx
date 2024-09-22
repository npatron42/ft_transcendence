import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers, getFriendsList } from '../api/api';  // Assurez-vous que les imports sont corrects
import FriendItem from './FriendItem';
import UserItem from './UserItem';
import Loading from '../loading_page/Loading';

const UsersFriendsList = ({ myUser }) => {
    const [socketMessage, setSocketMessage] = useState({});
    const [usersList, setUsersList] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [activeList, setActiveList] = useState('users');
    const myJwt = localStorage.getItem('jwt');

    const socketStatus = useRef(null);
    const socketInvite = useRef(null);

    useEffect(() => {
        const initSocketStatus = () => {
            const myUrl = "ws://localhost:8000/ws/status/?token=" + myJwt;
            socketStatus.current = new WebSocket(myUrl);

            socketStatus.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data["friends"]) {
                    changeFriendsList(data);
                }
                else if (data["AllUsers"]) {
                    changeUsersList(data["AllUsers"], friendsList)
                }
                else {
                    setSocketMessage(data);
                }
            };
        };

        const initSocketInvite = () => {
            const myURL = "ws://localhost:8000/ws/inviteFriend/?token=" + myJwt;
            socketInvite.current = new WebSocket(myURL);
            
            socketInvite.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data["friends"]) {
                    changeFriendsList(data);
                }
                if (data["AllUsers"])
                    changeUsersList(data["AllUsers"], friendsList)
            };
        };

        const changeFriendsList = (data) => {
            console.log(data)
            setFriendsList(data["friends"])
            console.log("MY FRIENDSLIST REFRESHED --> ", friendsList)
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
        
        const initMyLists = async () => {
             const myFriendsList = await defineFriendsList();
            await defineUsersList(myFriendsList);
        }

        initSocketStatus(); 
        initSocketInvite();
        initMyLists();
        
        return () => {
            if (socketStatus.current && socketStatus.current.readyState === WebSocket.OPEN) {
                socketStatus.current.close();
            }
            if (socketInvite.current && socketInvite.current.readyState === WebSocket.OPEN) {
                socketInvite.current.close();
            }
        };

    }, [myJwt, myUser.username]);
    

    const showUsersList = () => {
        setActiveList('users');
    }
    const showFriendsList = () => {
        setActiveList('friends');
    }

    const handleInvitation = (userInvited) => {
        if (socketInvite.current && socketInvite.current.readyState === WebSocket.OPEN) {
            setIsInviting(true);
            const data = {
                invitationFrom: myUser.username,
                to: userInvited.username,
                type: "friend",
                parse: myUser.username + "|" + userInvited.username
            }
            socketInvite.current.send(JSON.stringify(data));
            setIsInviting(false);
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
                    <div className="">
                        <h4 type="button" className="btn btn-outline-dark nameUserComponent" onClick={showUsersList}>
                            Users List
                        </h4>
                        <h4 type="button" className="btn btn-outline-dark nameFriendComponent" onClick={showFriendsList}>
                            Friends List
                        </h4>
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
