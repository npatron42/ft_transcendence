import React, { useEffect, useState } from 'react';
import { getUser } from '../api/api';

const FriendsList = ({ myUser }) => {
    
    const [numberOfConnected, setNumberOfConnected] = useState(0);
    const [socketMessage, setSocketMessage] = useState({});
    const [FriendsList, setFriendsList] = useState([]);


    useEffect(() => {
        const userStatus = () => {
            const myJwt = localStorage.getItem('jwt');
            const myUrl = "ws://localhost:8000/ws/status/?token=" + myJwt;
            const socket = new WebSocket(myUrl);

            socket.onmessage = function(event) {
                const data = JSON.parse(event.data);
                setSocketMessage(data);
                let numberOfConnected = Object.keys(data).length;
                setNumberOfConnected(numberOfConnected);
            };

            return () => {
                socket.close();
            };
        };

        const defineFriendsList = async () => {
          setFriendsList(myUser.friendsList)
        };

        defineFriendsList();
        const cleanup = userStatus();

        return () => {
            cleanup();
        };

    }, []);

    const chooseStatus = (username) => {
        return socketMessage[username] ? "Connected" : "Disconnected";
    };

    return (
        <div className="">
            <h2 className="welcome-message">Welcome {myUser.username}</h2>
                    <tr>
                        <th>FRIENDS LIST</th>
                        <th>Username</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
        </div>
    );
};

export default FriendsList;