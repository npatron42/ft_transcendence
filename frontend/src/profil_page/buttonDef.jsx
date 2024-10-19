import { useTranslation } from 'react-i18next';
import Dropdown from 'react-bootstrap/Dropdown';
import flagI from '../assets/login_page/italianFlag.svg';
import flagE from '../assets/login_page/englishFlag.svg';
import flagF from '../assets/login_page/frenchFlag.svg';

import './button.css'

function buttonDef() {
	const { t } = useTranslation();
	
	const lg = "IT";

  return (
	<div>
    <Dropdown className="custom-dropdown">
      <Dropdown.Toggle variant="secondary">
	  {t('profilPage.lg0')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
	  <Dropdown.Item>
		<img src={flagF} 
		onClick={() => handleFlagClick('fr')}
		style={{ cursor: 'pointer' }}></img></Dropdown.Item>
	  
	  <Dropdown.Item >
		<img src={flagI} 
		onClick={() => handleFlagClick('it')}></img></Dropdown.Item>
      
	  <Dropdown.Item>
		<img src={flagE} 
		 onClick={() => handleFlagClick('en')}></img></Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
	<p className="def-langue">{t('profilPage.lg')} </p>
	</div>
  );
}

export default buttonDef;