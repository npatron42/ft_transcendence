import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate, useLocation, } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import React, { useEffect, useState } from 'react';
import UnderNavbar from './UnderNavbar';
import Notifications from '../../notifications/Notifications';
import { getNotifs } from '../api/api';
import "./components.css"


function NavbarBS() {
  const { myUser } = useAuth();
  const [nbNotifs, setNbNotifs] = useState(0);
  const [notifIsClicked, setNotifClicked] = useState(false);


  const { subscribeToNotifs } = useWebSocket();
  const [profileShown, setProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/home";

  const handleHome = () => {
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
      const nbNotifsTmp = myData.length;
      setNbNotifs(nbNotifsTmp);
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



  return (
    <>
      <Navbar>
        <Nav>
          <Nav.Link as={NavLink} to="/ChooseGame">PONG</Nav.Link>
          <h1
            className={isHomePage ? "logo-navbar2" : "logo-navbar"}
            onClick={handleHome}
          >
            TRANSCENDENCE
          </h1>
          <Nav.Link as={NavLink} to="/chat">CHAT</Nav.Link>
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
                src={myUser.profilePicture}
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
      </Navbar>
    </>
  );
}

export default NavbarBS