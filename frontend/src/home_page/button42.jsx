import Button from 'react-bootstrap/Button';
import './button.css'
import myIcon from '../assets/42.svg';


function button42() {
	return (
	  <div>
	  <Button href="https://auth.42.fr/auth/realms/students-42/protocol/openid-connect/auth?client_id=intra&redirect_uri=https%3A%2F%2Fprofile.intra.42.fr%2Fusers%2Fauth%2Fkeycloak_student%2Fcallback&response_type=code&state=556fcf3c78dc5550fd754fd3ff7b59f264fe3d8e2b389184" 
	  variant="Dark" 
	  className="custom-42">Se connecter avec 
	  <img src={myIcon} style={{ marginLeft: '1vw', width: '2vw', height: '2.2vw'}} />
	  </Button>
	</div>
	);
  }
  
  export default button42;