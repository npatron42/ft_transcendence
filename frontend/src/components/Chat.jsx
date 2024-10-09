import "./chat.css"

import React, { useEffect, useState } from 'react';
import { useAuth } from "../provider/UserAuthProvider";


function Chat() {

    const {myUser} = useAuth()
    const [isPlusButtonClicked, setPlusButton] = useState(false);
    const [createButtonIsClicked, setCreateButtonClicked] = useState(false);
    const [joinButtonIsClicked, setJoinButtonClicked] = useState(false);

    const handlePlusButton = () => {
        setPlusButton(!isPlusButtonClicked);
        if (createButtonIsClicked === true)
            setCreateButtonClicked(false)
        if (joinButtonIsClicked === true)
            setJoinButtonClicked(false)
        console.log("Button Plus --> ", isPlusButtonClicked);
    }

    const handleCreateButton = () => {
        setCreateButtonClicked(!createButtonIsClicked);
        if (isPlusButtonClicked === true)
            setPlusButton(!isPlusButtonClicked);
        console.log("Button Create --> ", createButtonIsClicked);
    }

    const handleJoinButton = () => {
        setJoinButtonClicked(!joinButtonIsClicked);
        if (createButtonIsClicked === true)
            setCreateButtonClicked(false)
        if (isPlusButtonClicked === true)
            setPlusButton(!isPlusButtonClicked);
        setPlusButton(!isPlusButtonClicked);
        console.log("Button Join --> ", joinButtonIsClicked);
    }

    return (
        <div className="chat">
            <div className="chat-discussions">
                <div className="chat-header">
                    <div className="header-logo logo-header"><i class="bi bi-people-fill"></i></div>
                    <div className="header-logo logo-header"><i class="bi bi-chat"></i></div>
                    <div onClick={handlePlusButton} className="header-logo logo-header"><i class="bi bi-plus-circle"></i></div>
                </div>
            </div>
            {!isPlusButtonClicked && !createButtonIsClicked && !joinButtonIsClicked &&
            <div className="choiceButton">
                <div className="place-button">
                    <h5 className="welcomeMessage">Welcome {myUser.username} !</h5>
                </div>
            </div>
            }
            {isPlusButtonClicked && 
            <div className="choiceButton">
                <div className="place-button">
                    <button onClick={handleCreateButton} className="btn btn-outline-dark choiceButton-custom">CREATE</button>
                    <button onClick={handleJoinButton} className="btn btn-outline-dark choiceButton-custom">JOIN </button>
                </div>
            </div>
            }
            {createButtonIsClicked && !isPlusButtonClicked &&
            <div className="choiceButton">
                <div className="place-button">
                    <button onClick={handleCreateButton} className="btn btn-outline-dark choiceButton-custom">CREATE</button>
                    <button onClick={handleJoinButton} className="btn btn-outline-dark choiceButton-custom">CREATE </button>
                </div>
            </div>
            }
        </div>
    );
};

export default Chat;
