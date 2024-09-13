import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers } from '../api/api';  // Assurez-vous que les imports sont corrects

const UsersList = ({ myUser }) => {
    const [numberOfConnected, setNumberOfConnected] = useState(0);
    const [socketMessage, setSocketMessage] = useState({});
    const [usersList, setUsersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const myJwt = localStorage.getItem('jwt');

    const socketStatus = useRef(null);
    const socketInvite = useRef(null);

    useEffect(() => {
        const initSocketStatus = () => {
            const myUrl = "ws://localhost:8000/ws/status/?token=" + myJwt;
            socketStatus.current = new WebSocket(myUrl);

            socketStatus.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setSocketMessage(data);
                setNumberOfConnected(Object.keys(data).length);
            };

        };

        const initSocketInvite = () => {
            const myURL = 'ws://localhost:8000/ws/inviteFriend/?token=' + myJwt;
            socketInvite.current = new WebSocket(myURL);

            socketInvite.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(data);
            };
        };

        const defineUsersList = async () => {
            setIsLoading(true);
            const myList = await getAllUsers();
            const filteredList = myList.filter(user => user.username !== myUser.username);
            setUsersList(filteredList);
            setIsLoading(false);
        };

        initSocketStatus();
        initSocketInvite();
        defineUsersList();

        return () => {
            if (socketStatus.current && socketStatus.current.readyState === WebSocket.OPEN) {
                socketStatus.current.close();
            }
            if (socketInvite.current && socketInvite.current.readyState === WebSocket.OPEN) {
                socketInvite.current.close();
            }
        };

    }, [myJwt, myUser.username]);

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
            // NOTIFICATIONS TO USER
            // POST REQUEST TO BACKEND
        // else
        //     // POST REQUEST TO BACKEND

    };

    const chooseStatus = (username) => {
        return socketMessage[username] ? "Connected" : "Disconnected";
    };

    return (
        <div className="background-container">
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <table className="table table-striped table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>USERS LIST</th>
                            <th>Username</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No users found</td>
                            </tr>
                        ) : (
                            usersList.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{index + 1}</td>
                                    <td>{user.username}</td>
                                    <td>{chooseStatus(user.username)}</td>
                                    <td>
                                        <button
                                            onClick={() => handleInvitation(user)}
                                            className="btn btn-primary btn-sm me-2"
                                            disabled={isInviting}
                                        >
                                            {isInviting ? "Inviting..." : "Add"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UsersList;
