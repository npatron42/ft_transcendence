import "./chat.css"

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from "../provider/UserAuthProvider";
import { useWebSocket } from '../provider/WebSocketProvider';
import { getAllUsers, getMediaUrl } from "../api/api";
import { useNavigate } from 'react-router-dom';
import { getDiscussions, getFriendsList, getUsersList } from "../api/api";

import Message from "./Message";
import Loading from "../loading_page/Loading";
import ModalUserChat from "./ModalUserChat";
import { useTranslation } from 'react-i18next';

const host = import.meta.env.VITE_HOST;

function Chat() {

    const {myUser} = useAuth();
    
    const [myDiscuss, setDiscuss] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [friendsList, setFriendsList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [userSelected, setUserSelected] = useState(null);

    const [userIsClicked, setUserIsClicked] = useState(false)
    const [usersStatus, setUsersStatus] = useState([]);

    const { socketUser, subscribeToMessages, subscribeToStatus} = useWebSocket();
    const [friendsMessagesClicked, setFriendsMessagesClicked] = useState(false)
    const [usersMessagesClicked, setUsersMessagesClicked] = useState(false)
    const [blockedUsers, setBlockedUsers] = useState([])
    const [inputMessage, setInputMessage] = useState('');
    const { t } = useTranslation();

    const handleWriting = (event) => {
        if (event.key === 'Enter' && inputMessage.length !== 0) { 
            event.preventDefault();
            setInputMessage('')
            if (inputMessage.length > 250) {
                alert("TOO LONG MESSAGE") ;
                setInputMessage(null)
                return ;
            }
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
                setFriendsList(data["friends"])
            }
            if (data["AllUsers"]) {
                setUsersList(data["AllUsers"])
            }
            if (data["messages"]) {

                const dataSize = data["messages"].length;
                const sender = data["messages"][dataSize - 1].sender;
                const receiver = data["messages"][dataSize - 1].receiver;
                
                if (sender === myUser.id || (userSelected.id === sender && receiver === myUser.id)) {
                    setDiscuss(data["messages"]);
                }
            }
            if (data["blocked"])
                setBlockedUsers(data["blocked"])
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


    const chooseStatus = (id) => {
        if (usersStatus[id] === true)
            return ("online")
        else if (usersStatus[id] === "in-game")
            return ("in-game")
        return ("offline")
    };
 

    // HTTP --> USERSSTATUS + userslist

    
    const defineAllUsersStatus = async () => {
        const allUsers = await getAllUsers();
        const myResult = []
        for (let i = 0; i < allUsers.length; i++) {
            const id = allUsers[i].id;
            const hisStatus = allUsers[i].status;
            let hisStatusTmp;

            if (hisStatus === "online")
                hisStatusTmp = true
            else if (hisStatus === "in-game")
                hisStatusTmp = "in-game"
            else
                hisStatusTmp = false
            myResult[id] = hisStatusTmp;
        }
        setUsersStatus(myResult);
    }


    // HTTP INIT

    const initMyLists = async () => {

        const myFriendsList = await getFriendsList();
        const myUsersList = await getUsersList();

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

    const handleProfile = () => {
        if (userIsClicked === false) {
            setUserIsClicked(true);
            return ;
        }
        if (userIsClicked === true) {
            setUserIsClicked(false);
            return ;
        }
        return ;
    }

    const isUserBlocked = (userSelected) => {
        let i = 0;
        const mySize = blockedUsers.length
        while (i < mySize) {
            if (blockedUsers[i]["username"] === userSelected.username)
                return (true);
            i++;
        }
        return (false)
    }


    useEffect(() => {

        const getMessages = async () => {
            if ( userSelected !== null) {
                const myData = {
                    "selectedUser": userSelected.id
                }
                try {
                    const response = await getDiscussions(myData);
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
                                            <img src={getMediaUrl(user.profilePicture)} alt={`${user.username}'s profile`} className="profile-picture-discuss"/>
                                        </div>
                                        <div className="friend-name">
                                            <span className="friend-name-center">{user.username}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {usersMessagesClicked && !friendsMessagesClicked && (
                            <div className="chat-discussions-friends">
                                {usersList && usersList.map((user) => (
                                    <div key={user.username} onClick={() => handleClickDiscuss(user)} className="friend-presentation">
                                        <div className="friend-separate">
                                            <img src={getMediaUrl(user.profilePicture)} alt={`${user.username}'s profile`} className="profile-picture-discuss"/>
                                        </div>
                                        <div className="friend-name">
                                            <span className="friend-name-center">{user.username}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        </div>



                        {/* FRIENDS CLICKED ---> NO FRIENDS */}



                    {friendsMessagesClicked && !usersMessagesClicked && friendsList.length === 0 && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span-username">{t('chat.addFriend')}</span>
                        </div>
                    )}



                        {/* FRIENDS CLICKED ---> THERE IS FRIENDS */}

                    {friendsMessagesClicked && !usersMessagesClicked && friendsList.length !== 0 && userSelected === null && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span-username">{t('chat.chooseDiscuss')}</span>
                        </div>
                    )}


                        {/* FRIENDS CLICKED ---> FRIEND DISCUSS SELECTED */}


                    {friendsMessagesClicked && !usersMessagesClicked && friendsList.length !== 0 && userSelected !== null && !isUserBlocked(userSelected) && (
                        
                    <div className="principal-discussion">
                        <div className="header-discuss">
                            <div className="come-back">
                                <i onClick={handleComeBack} className="bi bi-arrow-left come-back-custom"></i>
                            </div>
                            <div className="header-discuss-name">
                                <span onClick={() => handleProfile()} className="header-discuss-name-custom">{userSelected.username}</span>
                            </div>
                            <div className="header-status">
                                <i className={`bi bi-circle-fill header-status-custom-${chooseStatus(userSelected.id)}`}></i>
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
                                placeholder={t('chat.write')}
                            />
                        </form>
                        {userIsClicked && (
                            <ModalUserChat userSelected={userSelected}/>
                        )}
                    </div>
                    )}

                    {!friendsMessagesClicked && !usersMessagesClicked && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span">{t('chat.welcome')}</span>
                            <span className="welcomeMessage-span-username">{myUser.username}</span>
                        </div>
                    )}


                        {/* USERS CLICKED ---> NO USERS */}


                    {usersMessagesClicked && !friendsMessagesClicked && usersList.length === 0 && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span-username">{t('chat.noUser')}</span>
                        </div>
                    )}


                        {/* USERS CLICKED ---> THERE IS USERS */}


                        {/* NO USER SEELCTED */}


                    {usersMessagesClicked && !friendsMessagesClicked && usersList.length !== 0 && userSelected === null && (
                        <div className="welcomeMessage">
                            <span className="welcomeMessage-span-username">{t('chat.chooseDiscuss')}</span>
                        </div>
                    )}


                        {/* USER SELECTED */}


                    {usersMessagesClicked && !friendsMessagesClicked && usersList.length !== 0 && userSelected !== null && !isUserBlocked(userSelected) && (
                    <div className="principal-discussion">
                        <div className="header-discuss">
                            <div className="come-back">
                                <i onClick={handleComeBack} className="bi bi-arrow-left come-back-custom"></i>
                            </div>
                            <div className="header-discuss-name">
                                <span onClick={() => handleProfile()} className="header-discuss-name-custom">{userSelected.username}</span>
                            </div>
                            <div className="header-status">
                                <i className={`bi bi-circle-fill header-status-custom-${chooseStatus(userSelected.id)}`}></i>
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
                                placeholder={t('chat.write')}
                            />
                        </form>
                        {userIsClicked && (
                            <ModalUserChat userSelected={userSelected}/>
                        )}
                    </div>
                    )}

                </>
            )}
        </div>
    );
}    

export default Chat;
