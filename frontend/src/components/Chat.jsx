import "./chat.css"

import React, { useEffect, useState } from 'react';
import { useAuth } from "../provider/UserAuthProvider";
import { useWebSocket } from '../provider/WebSocketProvider';
import { defineUsersFriendsList } from "../UsersList/utilsUsersFunctions";
import { getAllUsers } from "../api/api";
import { useNavigate } from 'react-router-dom';
import { getDiscussions } from "../api/api";

import Message from "./Message";
import Loading from "../loading_page/Loading";

function Chat() {

    
    const navigate = useNavigate()
    const {myUser} = useAuth();
    
    const [myDiscuss, setDiscuss] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [friendsList, setFriendsList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [userSelected, setUserSelected] = useState(null);

    const [usersStatus, setUsersStatus] = useState([]);

    const { socketUser, subscribeToMessages, subscribeToStatus} = useWebSocket();
    const [friendsMessagesClicked, setFriendsMessagesClicked] = useState(false)
    const [usersMessagesClicked, setUsersMessagesClicked] = useState(false)

    const [inputMessage, setInputMessage] = useState('');

    const handleWriting = (event) => {
        if (event.key === 'Enter') { 
            event.preventDefault();
            setInputMessage('')
            const myData = {
                "type": "MESSAGE",
                "sender": myUser,
                "receiver": userSelected,
                "message": inputMessage
            }
            socketUser.send(JSON.stringify(myData));
        }
    };

    const handleChange = (event) => {
        setInputMessage(event.target.value);
    };


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
            if (data["messages"]) {

                const dataSize = data["messages"].length;
                const sender = data["messages"][dataSize - 1].sender;
                const receiver = data["messages"][dataSize - 1].receiver;
                
                if (sender === myUser.id || (userSelected.id === sender && receiver === myUser.id)) {
                    setDiscuss(data["messages"]);
                    console.log("GOOD")
                    console.log("myDiscuss --> ", myDiscuss)
                }
            }
        };

        const handleStatus = (data) => {
            setUsersStatus(data["status"]);
        }

        const unsubscribeMess = subscribeToMessages(handleSocketUser);
        const unsubscribeStatus = subscribeToStatus(handleStatus);

        return () => {
            unsubscribeMess(); 
            unsubscribeStatus();
        };
    }, [subscribeToMessages, subscribeToStatus, socketUser, userSelected, myDiscuss]);


    const chooseStatus = (username) => {
        if (usersStatus[username] === true)
            return ("online")
        return ("offline")
    };

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
    }


    // HTTP INIT

    const initMyLists = async () => {

        const [myFriendsList, myUsersList] = await defineUsersFriendsList(myUser);
        setFriendsList(myFriendsList);
        setUsersList(myUsersList);
        await defineAllUsersStatus();
    };

    useEffect(() => {
        setIsLoading(true)
        initMyLists();
        setIsLoading(false)

    },[myUser.username])


    const handleClickDiscuss = (myUser) => {
        setUserSelected(myUser)
        return ;
    }

    const handleComeBack = () => {
        setUserSelected(null)
        return ;
    }

    const handleProfile = (myUser) => {
        const link = "/profile/" + myUser.username
        navigate(link)
        return ;
    }

    useEffect(() => {

        const getMessages = async () => {
            if ( userSelected !== null) {
                const myData = {
                    "selectedUser": userSelected.id
                }
                try {
                    const response = await getDiscussions(myData);
                    console.log("HTTP DISCUSS --> ", myDiscuss)
                    setDiscuss(response["allDiscussion"]);
                } catch (error) {
                    console.error("Erreur lors de la récupération des messages:", error);
                }
            };
        } 

        getMessages();
    }, [userSelected]);

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
                                    <div key={user.username} onClick={() => handleClickDiscuss(user)} className="friend-presentation">
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
    


                        {/* FRIENDS CLICKED ---> NO FRIENDS */}
                    


                    {friendsMessagesClicked && !usersMessagesClicked && friendsList.length === 0 && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span-username">Add some friends..</span>
                        </div>
                    )}



                        {/* FRIENDS CLICKED ---> THERE IS FRIENDS */}

                    {friendsMessagesClicked && !usersMessagesClicked && friendsList.length !== 0 && userSelected === null && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span-username">Choose a discuss</span>
                        </div>
                    )}


                        {/* FRIENDS CLICKED ---> FRIEND DISCUSS SELECTED */}


                    {friendsMessagesClicked && !usersMessagesClicked && friendsList.length !== 0 && userSelected !== null && (
                        
                        <div className="principal-discussion">
                        <div className="header-discuss">
                            <div className="come-back">
                                <i onClick={handleComeBack} className="bi bi-arrow-left come-back-custom"></i>
                            </div>
                            <div className="header-discuss-name">
                                <span onClick={() => handleProfile(userSelected)} className="header-discuss-name-custom">{userSelected.username}</span>
                            </div>
                            <div className="header-status">
                                <i className={`bi bi-circle-fill header-status-custom-${chooseStatus(userSelected.username)}`}></i>
                            </div>
                        </div>
                        <div className="core-discussion">
                            <Message myDiscuss={myDiscuss} myUser={myUser} userSelected={userSelected}/>
                        </div>
                        <form className="form-custom" onSubmit={e => e.preventDefault()}>
                            <input
                                className="typing-text-custom"
                                type="text"
                                value={inputMessage}
                                onKeyDown={handleWriting}
                                onChange={handleChange}
                                placeholder="Write here"
                            />
                        </form>
                    </div>
                    )}

                    {!friendsMessagesClicked && !usersMessagesClicked && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span">Welcome</span>
                            <span className="welcomeMessage-span-username">{myUser.username}</span>
                        </div>
                    )}


                        {/* USERS CLICKED ---> NO USERS */}


                    {usersMessagesClicked && !friendsMessagesClicked && usersList.length === 0 && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span-username">There is no Users...</span>
                        </div>
                    )}


                        {/* USERS CLICKED ---> THERE IS USERS */}


                    {usersMessagesClicked && !friendsMessagesClicked && usersList.length !== 0 && (
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
