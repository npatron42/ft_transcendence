import "./chat.css"

import React, { useEffect, useState } from 'react';
import { useAuth } from "../provider/UserAuthProvider";


function Chat() {

    const {myUser} = useAuth()
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

    return (
        <div className="chat">


            {/* DIV USERS/FRIENDS LEFT */}


            <div className="chat-discussions">
                <div className="chat-header">
                    <div className="header-logo logo-header">
                        <i onClick={handleFriendsMessages} className="bi bi-people-fill"></i>
                    </div>
                    <div className="header-logo logo-header">
                        <i onClick={handleUsersMessages} className="bi bi-chat"></i>
                    </div> 
                </div>

                {!friendsMessagesClicked && !usersMessagesClicked &&
                <div className="welcomeMessage">
                    <span className="welcomeMessage-span">Welcome</span>
                    <span className="welcomeMessage-span-username">{myUser.username}</span>
                </div>
                }
                {friendsMessagesClicked && !usersMessagesClicked &&
                    <div className="welcomeMessage">
                        <span className="welcomeMessage-span">Friends</span>
                    </div>
                }
                {usersMessagesClicked && !friendsMessagesClicked &&
                    <div className="welcomeMessage">
                        <span className="welcomeMessage-span">USERS</span>
                    </div>
                }
            </div>


                {/* DIV DISCUSSIONS RIGHT */}


            {!friendsMessagesClicked && !usersMessagesClicked &&
                <div className="welcomeMessage">
                    <span className="welcomeMessage-span">Welcome</span>
                    <span className="welcomeMessage-span-username">{myUser.username}</span>
                </div>
            }
            {friendsMessagesClicked && !usersMessagesClicked &&
                <div className="welcomeMessage">
                    <span className="welcomeMessage-span">Friends</span>
                </div>
            }
            {usersMessagesClicked && !friendsMessagesClicked &&
                <div className="welcomeMessage">
                    <span className="welcomeMessage-span">USERS</span>
                </div>
            }
        </div>
    );
};

export default Chat;
