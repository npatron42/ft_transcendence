import "../index.css";
import "./Home.css";
import "../App.css";
import Langue from '../login_page/languages.jsx';
import { getUser } from '../api/api'
import { useNavigate } from 'react-router-dom';
import Languages from "../login_page/languages";
import NavbarBS from "../components/Navbar";
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import UsersFriendsList  from "../UsersList/UsersFriendsList";
import Loading from "../loading_page/Loading";
import MatchHistory from "../components/MatchHistory";
import HomeCadre from "./HomeCadre";
import CadrePlay from "./CadrePlay";

const Home = () => {
    const [myUser, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const myJwt = localStorage.getItem("jwt");
    
    console.log("myUser HOME ---> ", myUser)

    useEffect(() => {
        if (!myJwt) {
            navigate('/');
            return;
        }

        const defineUser = async () => {
            try {
                const myUserTmp = await getUser();
                setUser(myUserTmp);
            } catch (error) {
                localStorage.removeItem("jwt");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        defineUser();
    }, [myJwt, navigate]);

    if (loading) {
        return (
            <div id="background-container">
                <Loading />
            </div>
        );
    }



    return (
        <div id="background-container">
            <Langue/>
            <div className="custom2-cadre">
                <NavbarBS myUser={myUser} />
                <div className="playPlacement">
                    <CadrePlay/>
                </div>
                <div className="usersFriendsListPlacement">
                    <UsersFriendsList myUser={myUser} />
                </div>
                <div className="matchHistoryPlacement">
                    <MatchHistory/>
                </div>
            </div>
        </div>
    );
};

export default Home;

