import "../index.css";
import "./Home.css";
import "../App.css";
import Languages from "../login_page/languages";
import { useAuth } from "../provider/UserAuthProvider";
import NavbarBS from "../components/Navbar";
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import UsersFriendsList  from "../UsersList/UsersFriendsList";
import Loading from "../loading_page/Loading";
import MatchHistory from "../components/MatchHistory";
import HomeCadre from "./HomeCadre";
import CadrePlay from "./CadrePlay";

const Home = () => {

    const {myUser} = useAuth()


    return (
        <div id="background-container">
            <div className="custom2-cadre">
                
                <Languages></Languages>
                <NavbarBS />
                <div className="playPlacement">
                    <CadrePlay/>
                </div>
                <div className="usersFriendsListPlacement">
                    <UsersFriendsList />
                </div>
                <div className="matchHistoryPlacement">
                    <MatchHistory/>
                </div>
            </div>
        </div>
        )
};

export default Home;

