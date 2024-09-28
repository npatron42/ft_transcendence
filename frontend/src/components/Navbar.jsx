import { Navbar, Container, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import "./components.css"

function NavbarBS() {
  return (
    <>
      <Navbar className="navbar-bs">
        <Container>
	        <Nav className="police">
            <Nav.Link as={NavLink} to="/home">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/ChooseGame">Play</Nav.Link>
            <Nav.Link as={NavLink} to="/Profile">Profile</Nav.Link>
		  <Navbar.Brand className="police">Transcendence</Navbar.Brand>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

export default NavbarBS;
