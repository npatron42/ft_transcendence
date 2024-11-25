import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate, useLocation, } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';
import { getGamesInvitations, getFriendsInvitations } from '../api/api';
import React, { useEffect, useState } from 'react';
import UnderNavbar from './UnderNavbar';
import Notifications from '../notifications/Notifications';
import Chat from './Chat';
import flagF from '../assets/login_page/frenchFlag.svg'
import flagI from '../assets/login_page/italianFlag.svg';
import flagE from '../assets/login_page/englishFlag.svg';
import { useTranslation } from 'react-i18next';
import Languages from '../login_page/languages';

import "./components.css"

const host = import.meta.env.VITE_HOST;

function NavbarBS() {
  const { myUser } = useAuth();
  const [nbFriendsInvitations, setNbFriendsInvitations] = useState(0);
  const [nbGamesInvitations, setNbGameInvitations] = useState(0);
  const [notifIsClicked, setNotifClicked] = useState(false);
  const myJwt = localStorage.getItem('jwt')

  const { subscribeToNotifs } = useWebSocket();
  const [profileShown, setProfile] = useState(false);
  const [homeShown, setHomeShown] = useState(true);
  const [chatShown, setChatShown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/home";
  const { i18n } = useTranslation();
  const [selectedFlag, setSelectedFlag] = useState(null);
  
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
    if (chatShown === true)
      setChatShown(!chatShown)
    navigate("/home");
  };

  useEffect(() => {
    const handleNotif = (data) => {
      if (data["friendsInvitations"]) {
        const nbFriendsInvitationsTmp = data["friendsInvitations"].length;
        setNbFriendsInvitations(nbFriendsInvitationsTmp);
      }

      if (data["gamesInvitations"]) {
        const nbGamesInvitationsTmp = data["gamesInvitations"].length;
        setNbGameInvitations(nbGamesInvitationsTmp);
      }
    };

    const unsubscribe = subscribeToNotifs(handleNotif);

    
    const initNotifs = async () => {
      if (myJwt) {
        const myFriendData = await getFriendsInvitations();
        const myGameData = await getGamesInvitations();
        const fn = myFriendData.length;
        const gn = myGameData.length;
        setNbFriendsInvitations(fn);
        setNbGameInvitations(gn)
      }
      }
    
    initNotifs();
    
    return () => {
      unsubscribe();
    };

  }, [subscribeToNotifs, nbFriendsInvitations, nbGamesInvitations]);


  
	useEffect(() => {
	  const jwt = localStorage.getItem('jwt');
	  
	  if (jwt) {
		const storedLang = localStorage.getItem('i18nextLng');
		if (storedLang) {
		  setSelectedFlag(storedLang);
		  i18n.changeLanguage(storedLang);
		}
	  } 
	  else {
		const storedLang = sessionStorage.getItem('i18nextLng');
		if (storedLang){
		  setSelectedFlag(storedLang);
		  i18n.changeLanguage(storedLang);
			} 
		else {
		  setSelectedFlag('fr');
		  i18n.changeLanguage('fr');
			}
		}
	}, [i18n]);
  
	const handleFlagClick = (language) => {
	setSelectedFlag(language);
	i18n.changeLanguage(language);
	  
	 
	const jwt = localStorage.getItem('jwt');

	if (jwt)
		localStorage.setItem('i18nextLng', language);
	else
		sessionStorage.setItem('i18nextLng', language);

	};


  const handleProfile = () => {
    setProfile(!profileShown);
    if (notifIsClicked === true)
      setNotifClicked(!notifIsClicked);

  };

  const handleNotif = () => {
    setNotifClicked(!notifIsClicked);
    if (profileShown === true)
      setProfile(!profileShown);
    console.log("YES")

  };

  const handleOtherLocations = () => {
    if (profileShown === true)
      setProfile(!profileShown);
    if (homeShown === true)
      setHomeShown(!homeShown);
    if (chatShown === true)
      setChatShown(!chatShown)
  }

  const handleChat = () => {
    if (profileShown === true)
      setProfile(!profileShown);
    setChatShown(!chatShown);
    if (profileShown === true)
      setProfile(!profileShown);
  }

  const chooseCssForMePlease = () => {
    if (location.pathname === "/home")
      return ("logo-navbar-active");
    return ("logo-navbar");
  }

  return (
    <>
      <Navbar>
        <Nav>
          <Nav.Link onClick={handleOtherLocations} as={NavLink} to="/ChooseGame">PONG</Nav.Link>
          <Nav.Link onClick={() => handleHome()} className="nav-link-logo">
              <span className={chooseCssForMePlease()}> TRANSCENDENCE </span>
          </Nav.Link>
          <Nav.Link onClick={() => handleChat()}>CHAT</Nav.Link>
        </Nav>

        <Nav className="navbar-nav-profile">
        <div className="notif-placement">
          {nbFriendsInvitations === 0 && nbGamesInvitations === 0? (
            <i onClick={() => handleNotif()} className="bi bi-bell-fill notif"></i>
          ) : (
            <i onClick={() => handleNotif()} className="bi bi-bell-fill notifFull"></i>
          )}
        </div>
          {myUser && myUser.profilePicture && (
            <div className="profile-container">
              <img
                src={myUser.profilePicture.startsWith('http') ? myUser.profilePicture : `http://${host}:8000/media/${myUser.profilePicture}`}
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