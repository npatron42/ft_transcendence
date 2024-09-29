import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import "./components.css"


function NavbarBS({ myUser }) {
  const navigate = useNavigate();

  const location = useLocation();

  const isHomePage = location.pathname === "/home";

  const handleHome = () => {
    navigate("/home")
    console.log("NAVBAR USER ---> ", myUser)
  };

  return (
    <>
      <Navbar>
          <Nav>
            <Nav.Link as={NavLink} to="/ChooseGame">PONG</Nav.Link>
            <h1 className={isHomePage ? 'logo-navbar2' : 'logo-navbar'} onClick={handleHome}>TRANSCENDENCE</h1>
            <Nav.Link as={NavLink} to="/chat">CHAT</Nav.Link>
          </Nav>
          <Nav className="navbar-nav-profile">
            <div className="notif-placement">
              <i class="bi bi-search notif"></i>
            </div>
            <div className="notif-placement">
              <i class="bi bi-bell-fill notif"></i>
            </div>
            <Nav.Link as={NavLink} to="/profile" className="nav-link-profile">
            {myUser && myUser.profilePicture ? (
              <img 
                src={myUser.profilePicture}
                alt="Profile" 
                className="profile-picture-navbar"
              />
            ) : (
              <div></div>
            )}
          </Nav.Link>
          </Nav>
      </Navbar>

    </>
  );
}


export default NavbarBS;


