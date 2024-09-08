import React, { useEffect, useState } from 'react';
import { getUser } from '../api/api';

const FriendsList = () => {
    
    const [numberOfConnected, setNumberOfConnected] = useState(0);
    const [socketMessage, setSocketMessage] = useState({});
    const [FriendsList, setFriendsList] = useState([]);
    const [myUser, setUser] = useState([]);


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

        const defineUser = async () => {
          const tmpUser = await getUser();
          setUser(tmpUser);
          console.log(tmpUser);
          await defineFriendsList();
          console.log("Friend List de ", tmpUser.username);
          console.log(FriendsList);
      };
        defineUser();
        const cleanup = userStatus();

        return () => {
            cleanup();
        };

    }, []);

    const chooseStatus = (username) => {
        return socketMessage[username] ? "Connected" : "Disconnected";
    };

    return (
        <div className="background-container">
            <h2 className="welcome-message">Welcome {myUser.username}</h2>
            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                    <tr>
                        <th>FRIENDS LIST</th>
                        <th>Username</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
            </table>
        </div>
    );
};

export default FriendsList;