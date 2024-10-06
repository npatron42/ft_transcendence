import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate, useLocation, } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import React, { useEffect, useState } from 'react';
import Logout from '../logout/Logout';
import UnderNavbar from './UnderNavbar';
import "./components.css"


function NavbarBS() {
  const { myUser } = useAuth();
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
      console.log("NOTIF HERE --> ", data);
    };

    const unsubscribe = subscribeToNotifs(handleNotif);

    return () => {
      unsubscribe();
    };
  }, [subscribeToNotifs]);

  const handleDisconnect = () => {
    localStorage.removeItem("jwt");
    navigate("/");
  };

  const handleProfile = () => {
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
            <i className="bi bi-bell-fill notif"></i>
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
      </Navbar>
    </>
  );
}

export default NavbarBS