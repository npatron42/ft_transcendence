import Button from 'react-bootstrap/Button';
import './button.css'
import myIcon from '../assets/login_page/42.svg';
import { useTranslation } from 'react-i18next';


function button42() {
	const { t } = useTranslation();
	return (
	  <div>
	  <Button href="https://api.intra.42.fr/oauth/authorize"
	  variant="outline-dark" 
	  className="custom-42">{t('loginPage.log42')} 
	  <img src={myIcon} style={{ marginLeft: '1vw', width: '2vw', height: '2.2vw'}} />
	  </Button>
	</div>
	);
  }
  
  export default button42;
