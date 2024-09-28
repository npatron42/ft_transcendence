import { Navbar, Container, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import "./components.css"

function NavbarBS({ myUser }) {
  return (
    <>
      <Navbar>
          <Nav>
            <Nav.Link as={NavLink} to="/home">HOME</Nav.Link>
            <Nav.Link as={NavLink} to="/ChooseGame">PLAY</Nav.Link>
            <Nav.Link as={NavLink} to="/chat">CHAT</Nav.Link>
            <h1 className="logo-navbar">TRANSCENDENCE</h1>
            <Nav.Link as={NavLink} to="/home">HOME</Nav.Link>
            <Nav.Link as={NavLink} to="/ChooseGame">PLAY</Nav.Link>
            <Nav.Link as={NavLink} to="/chat">CHAT</Nav.Link>
          </Nav>
          {/* <Nav className="">
            
          </Nav> */}
      </Navbar>
      {/* <Navbar className="navbar-right">
          <Nav className="police-navbar">
            <Nav.Link as={NavLink} to="/home">HOME</Nav.Link>
            <Nav.Link as={NavLink} to="/ChooseGame">PLAY</Nav.Link>
        <Nav className="ml-auto">
            {myUser && (
              <Nav.Link as={NavLink} to="/profile" className="profile-navbar">
              <img 
                src={myUser.profilePicture}
                alt="Profile" 
                className="profile-picture-navbar"
                />
            </Nav.Link>
            )}
          </Nav>
          </Nav>
      </Navbar> */}
    </>
  );
}


export default NavbarBS;


