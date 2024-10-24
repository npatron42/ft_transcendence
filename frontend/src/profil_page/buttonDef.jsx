import { useTranslation } from 'react-i18next';
import Dropdown from 'react-bootstrap/Dropdown';
import flagI from '../assets/login_page/italianFlag.svg';
import flagE from '../assets/login_page/englishFlag.svg';
import flagF from '../assets/login_page/frenchFlag.svg';
import { useAuth } from '../provider/UserAuthProvider';
import { getUser } from '../api/api';
import './button.css'
import { sendLangue } from '../api/api';

function buttonDef() {
	const { t } = useTranslation();
	const {myUser, setUser} = useAuth();

	const changeLanguage =  async (langue) => {
			const response = await sendLangue(langue);
			console.log("Response received:", response);
			if (response){
				const tmpUser = await getUser();
          		setUser(tmpUser);
			}
	};

  return (
	<div>
    <Dropdown className="custom-dropdown">
      <Dropdown.Toggle variant="secondary">
	  {t('profilPage.lg0')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
	  <Dropdown.Item onClick={() => changeLanguage('fr')}>
		<img src={flagF}></img></Dropdown.Item>
	  
	  <Dropdown.Item onClick={() => changeLanguage('it')} >
		<img src={flagI}></img></Dropdown.Item>
      
	  <Dropdown.Item onClick={() => changeLanguage('en')}>
		<img src={flagE}></img></Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
	<p className="def-langue">{t('profilPage.lg')} {myUser.langue}</p>
	</div>
  );
}

export default buttonDef;