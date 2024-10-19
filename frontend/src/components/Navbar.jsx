import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate, useLocation, } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getNotifs } from '../api/api';
import React, { useEffect, useState } from 'react';
import UnderNavbar from './UnderNavbar';
import Notifications from '../notifications/Notifications';
import logo from "../assets/logos/transcendence-logo.png"
import logoActive from "../assets/logos/transcendence-logo-active.png"
import Chat from './Chat';

import "./components.css"

function NavbarBS() {
  const { myUser } = useAuth();
  const [nbNotifs, setNbNotifs] = useState(0);
  const [notifIsClicked, setNotifClicked] = useState(false);

  const { subscribeToNotifs } = useWebSocket();
  const [profileShown, setProfile] = useState(false);
  const [homeShown, setHomeShown] = useState(true);
  const [chatShown, setChatShown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/home";

  if (myUser)
    console.log(myUser.profilePicture);
  useEffect(() => {
    if (location.pathname === "/home") {
      setHomeShown(true);
    } else {
      setHomeShown(false);
    }
  }, [location.pathname]);

  const handleHome = () => {
    if (location.pathname !== "/home")
      setHomeShown(prevHomeShown => !prevHomeShown);
    navigate("/home");
  };

  useEffect(() => {
    const handleNotif = (data) => {
      const nbNotifsTmp = data["friendsInvitations"].length;
      setNbNotifs(nbNotifsTmp);
    };

    const unsubscribe = subscribeToNotifs(handleNotif);

    
    const initNotifs = async () => {
      const myData = await getNotifs();
      const realNbNotifs = myData["friendsInvitations"].length + myData["gameInvitations"].length;
      setNbNotifs(realNbNotifs);
    }
    
    initNotifs();
    
    return () => {
      unsubscribe();
    };

  }, [subscribeToNotifs, nbNotifs]);



  const handleProfile = () => {
    setProfile(!profileShown);
    if (notifIsClicked === true)
      setNotifClicked(!notifIsClicked);

  };

  const handleNotif = () => {
    setNotifClicked(!notifIsClicked);
    if (profileShown === true)
      setProfile(!profileShown);
  };

  const handleOtherLocations = () => {
    if (homeShown === true)
      setHomeShown(!homeShown);
  }

  const handleChat = () => {
    console.log(setChatShown(!chatShown));
    if (profileShown === true)
      setProfile(!profileShown);
  }


  return (
    <>
      <Navbar>
        <Nav>
          <Nav.Link onClick={handleOtherLocations} as={NavLink} to="/ChooseGame">PONG</Nav.Link>
          {homeShown ? (
            <img src={logoActive} className="logo-transcendence" onClick={handleHome}/>
          ) : (
            <img src={logo} className="logo-transcendence" onClick={handleHome}/>  
          )}
          <Nav.Link onClick={() => handleChat()}>CHAT</Nav.Link>
        </Nav>

        <Nav className="navbar-nav-profile">
        <div className="notif-placement">
          {nbNotifs === 0 ? (
            <i onClick={() => handleNotif()} className="bi bi-bell-fill notif"></i>
          ) : (
            <i onClick={() => handleNotif()} className="bi bi-bell-fill notifFull"></i>
          )}
        </div>
          {myUser && myUser.profilePicture && (
            <div className="profile-container">
              <img
                src={myUser.profilePicture.startsWith('http') ? myUser.profilePicture : `http://localhost:8000/media/${myUser.profilePicture}`}
                alt="Profile"
                className="profile-picture-navbar"
                onClick={handleProfile}
              />
            </div>
          )}
            </Nav>
          {profileShown && (
              <UnderNavbar/>
          )}
          {notifIsClicked && (
            <Notifications/>
          )}
          {chatShown === true && (
            <Chat/>
          )}
      </Navbar>
    </>
  );
}

export default NavbarBS