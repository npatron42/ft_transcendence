import Button from 'react-bootstrap/Button';
import './button.css'
import myIcon from '../assets/login_page/42.svg';
import { useTranslation } from 'react-i18next';


function button42() {
	const { t } = useTranslation();
	return (
	  <div>
	  <Button href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-833368055563188d4e7433e8ee83fe676656a831c2c0651ff295be883bde7122&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcheck42user&response_type=code"
	  variant="outline-dark" 
	  className="custom-42">{t('loginPage.log42')} 
	  <img src={myIcon} style={{ marginLeft: '1vw', width: '2vw', height: '2.2vw'}} />
	  </Button>
	</div>
	);
  }
  
  export default button42;
