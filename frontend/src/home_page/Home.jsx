import "../index.css";
import "./Home.css";
import "../App.css";
import { fetchData, getAllUsers, getUser } from '../api/api'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import WebSocketComponent from "../FriendsList/FriendsList";
import 'bootstrap/dist/css/bootstrap.min.css';
import UsersList  from "../UsersList/UsersList";

const Home = () => {

    const [myUser, setUser] = useState(null);
    useEffect(() => {
        
        const fetchDataAndGetUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const codeFromUrl = params.get('code');
            if (codeFromUrl)
                await fetchData(codeFromUrl);
            const userData = await getUser();
            setUser(userData);
        };

        fetchDataAndGetUser();
        
    }, []);

    return (
    <div className="background-container">
        <UsersList/>
    </div>
    )
}

export default Home;
