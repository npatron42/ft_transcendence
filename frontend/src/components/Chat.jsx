import "./chat.css"

import React, { useEffect, useState } from 'react';
import { useAuth } from "../provider/UserAuthProvider";
import { useWebSocket } from '../provider/WebSocketProvider';
import { defineUsersFriendsList } from "../UsersList/utilsUsersFunctions";
import { getAllUsers } from "../api/api";


import Loading from "../loading_page/Loading";

function Chat() {

    const [isLoading, setIsLoading] = useState(true);
    const {myUser} = useAuth();
    const [friendsList, setFriendsList] = useState([]);
    const [usersList, setUsersList] = useState([]);

    const [usersStatus, setUsersStatus] = useState([]);

    const { socketUser, subscribeToMessages, subscribeToStatus} = useWebSocket();
    const [friendsMessagesClicked, setFriendsMessagesClicked] = useState(false)
    const [usersMessagesClicked, setUsersMessagesClicked] = useState(false)

    const handleFriendsMessages = () => {
        if (friendsMessagesClicked === true) {
            setUsersMessagesClicked(false)
            setFriendsMessagesClicked(false)
            return ;
        }
        setFriendsMessagesClicked(true)
        if (usersMessagesClicked === true)
            setUsersMessagesClicked(false)
    }

    const handleUsersMessages = () => {
        if (usersMessagesClicked === true) {
            setUsersMessagesClicked(false)
            setFriendsMessagesClicked(false)
            return ;
        }
        setUsersMessagesClicked(true)
        if (friendsMessagesClicked === true)
            setFriendsMessagesClicked(false)
    }


    // USEEFFECT FRIENDSLIST USERSLIST

    useEffect(() => {
        const handleSocketUser = (data) => {
            if (data["friends"]) {
                changeFriendsList(data);
            }
            if (data["AllUsers"]) {
                changeUsersList(data["AllUsers"], friendsList);
            }
        };

        const handleStatus = (data) => {
            setUsersStatus(data["status"]);
            console.log(data["status"])
        }

        const unsubscribeMess = subscribeToMessages(handleSocketUser);
        const unsubscribeStatus = subscribeToStatus(handleStatus);

        return () => {
            unsubscribeMess(); 
            unsubscribeStatus();
        };
    }, [subscribeToMessages, subscribeToStatus, socketUser]);



    // SOCKET FRIENDSLIST

    const changeFriendsList = (data) => {
        setFriendsList(data["friends"])
    } 


    // HTTP --> USERSSTATUS + userslist

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
    
    const defineAllUsersStatus = async () => {
        const allUsers = await getAllUsers();
        const status = []
        for (let i = 0; i < allUsers.length; i++) {
            const username = allUsers[i].username;
            const hisStatus = allUsers[i].status;
            let hisStatusTmp;

            if (hisStatus === "online")
                hisStatusTmp = true
            else
                hisStatusTmp = false
                status[username] = hisStatusTmp;
        }
        setUsersStatus(status);
        console.log("status --> ", status)
    }


    // HTTP INIT

    const initMyLists = async () => {

        const [myFriendsList, myUsersList] = await defineUsersFriendsList(myUser);
        setFriendsList(myFriendsList);
        setUsersList(myUsersList);
        console.log("Ma UsersList into chat ---> ", myUsersList);
        console.log("Ma FriendsList into chat ---> ", myFriendsList);
        await defineAllUsersStatus();
    };

    useEffect(() => {
        setIsLoading(true)
        initMyLists();
        setIsLoading(false)

    },[myUser.username])



    return (
        <div className="chat">
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <div className="chat-discussions">
                        <div className="chat-header">
                            <div className="header-logo logo-header">
                                <i onClick={handleFriendsMessages} className="bi bi-people-fill"></i>
                            </div>
                            <div className="header-logo logo-header">
                                <i onClick={handleUsersMessages} className="bi bi-chat"></i>
                            </div>
                        </div>
    
                        {!friendsMessagesClicked && !usersMessagesClicked && (
                            <div className="welcomeMessage">
                            </div>
                        )}


                        {friendsMessagesClicked && !usersMessagesClicked && (
                            <div className="chat-discussions-friends">
                                {friendsList && friendsList.map((user) => (
                                    <div key={user.username} className="friend-presentation">
                                        <div className="friend-separate">
                                            <img src={user.profilePicture} alt={`${user.username}'s profile`} className="profile-picture-discuss" />
                                        </div>
                                        <div className="friend-name">
                                            <span className="friend-name-center">{user.username}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {usersMessagesClicked && !friendsMessagesClicked && (
                            <div className="welcomeMessage">
                            </div>
                        )}
                    </div>
    
                    {!friendsMessagesClicked && !usersMessagesClicked && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span">Welcome</span>
                            <span className="welcomeMessage-span-username">{myUser.username}</span>
                        </div>
                    )}
                    {friendsMessagesClicked && !usersMessagesClicked && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span">Friends</span>
                        </div>
                    )}
                    {usersMessagesClicked && !friendsMessagesClicked && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span">USERS</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}    

export default Chat;
