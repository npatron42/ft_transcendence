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
import { useAuth } from "../provider/UserAuthProvider";

const Home = () => {

    const { myUser } = useAuth();

    console.log("myuser",myUser);

    // const langue = localStorage.getItem('i18nextLng');

    // useEffect(() => {
    // {
    //     console.log("myuser ==", myUser.langue)
    //     console.log("test langue", langue);
    //     // localStorage.setItem("i18nextLng", myUser.langue);
    //     console.log("test langue", localStorage.getItem('i18nextLng'))
    //   }
    // }, [myUser]);

    return (
        <div id="background-container">
            <>
                <Languages/>
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

