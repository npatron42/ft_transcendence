import "../index.css";
import "./Home.css";
import "../App.css";
import { fetchData, getAllUsers, getUser } from '../api/api'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import UsersList  from "../UsersList/UsersList";
import FriendsList from "../UsersList/FriendsList";

const Home = () => {
    const [myUser, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDataAndGetUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const codeFromUrl = params.get('code');
            if (codeFromUrl)
                await fetchData(codeFromUrl);
            const userData = await getUser();
            setUser(userData);
            setLoading(false);
        };

        fetchDataAndGetUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="background-container">
            <UsersList myUser={myUser} />
        </div>
    );
}

export default Home;

