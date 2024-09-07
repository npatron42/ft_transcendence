import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../api/api';

const UsersList = () => {
    
    const [numberOfConnected, setNumberOfConnected] = useState(0);
    const [socketMessage, setSocketMessage] = useState({});
    const [usersList, setUsersList] = useState([]);

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

        const defineUsersList = async () => {
            const myList = await getAllUsers();
            setUsersList(myList);
        };

        defineUsersList();
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
            <h2 className="mb-4">Users List</h2>
            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                    <tr>
                        <th>#</th>
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
                                    <button className="btn btn-primary btn-sm me-2">Edit</button>
                                    <button className="btn btn-danger btn-sm">Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UsersList;
