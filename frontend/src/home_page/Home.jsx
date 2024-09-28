import "../index.css";
import "./Home.css";
import "../App.css";
import { fetchData, getAllUsers, getUser } from '../api/api'
import NavbarBS from "../components/Navbar";
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import UsersFriendsList  from "../UsersList/UsersFriendsList";
import Loading from "../loading_page/Loading";

const Home = () => {
    const [myUser, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFriendShown, setIsFriendShown] = useState(false);

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
        return <Loading/>;
    }

    return (
        <div className="background-container">
            {/* <h2 className="welcome-message">Welcome {myUser.username}</h2> */}
            <div className="card-users" >
                    <UsersFriendsList myUser={myUser} />
            </div>
        </div>
    );
}

export default Home;

