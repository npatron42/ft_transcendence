import { useTranslation } from 'react-i18next';
import Dropdown from 'react-bootstrap/Dropdown';
import flagI from '../assets/login_page/italianFlag.svg';
import flagE from '../assets/login_page/englishFlag.svg';
import React, { useState , useEffect} from 'react';
import flagF from '../assets/login_page/frenchFlag.svg';

import './button.css'

function buttonDef() {

	const lg = "IT";

  return (
	<div>
    <Dropdown className="custom-dropdown">
      <Dropdown.Toggle variant="secondary">
        Dropdown Button
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
	<p className="def-langue">Langue par defautl: </p>
	</div>
  );
}

export default buttonDef;