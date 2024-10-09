import "./chat.css"

import React, { useEffect, useState } from 'react';
import { useAuth } from "../provider/UserAuthProvider";


function Chat() {

    const {myUser} = useAuth()

    const handlePlusButton = () => {
        setPlusButton(!isPlusButtonClicked);
    }

    return (
        <div className="chat">

            <div className="chat-discussions">
                <div className="chat-header">
                    <div className="header-logo logo-header">
                        <i class="bi bi-people-fill"></i>
                    </div>
                    <div className="header-logo logo-header">
                        <i class="bi bi-chat"></i>
                    </div>
                </div>
            </div>
            <div className="welcomeMessage">
                <span className="welcomeMessage-span">Welcome {myUser.username}</span>
            </div>
        </div>
    );
};

export default Chat;
