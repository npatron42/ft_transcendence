import "../index.css";
import "./Home.css";
import "../App.css";
import Languages from "../login_page/languages"
import NavbarBS from "../components/Navbar";
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import UsersFriendsList  from "../UsersList/UsersFriendsList";
import MatchHistory from "../components/MatchHistory";
import CadrePlay from "./CadrePlay";

const Home = () => {


    return (
        <div id="background-container">
            <>
                <div className="custom2-cadre">
                    
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
            </>
        </div>
        )
};

export default Home;

