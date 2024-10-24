import flagF from '../assets/login_page/frenchFlag.svg';
import flagI from '../assets/login_page/italianFlag.svg';
import flagE from '../assets/login_page/englishFlag.svg';
import React, { useState , useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import './cadre.css';


function Languages() {
	const { i18n } = useTranslation();
	const [selectedFlag, setSelectedFlag] = useState(null);
  
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
	
	return (
	  <div>
		<img 
		  src={flagF} 
		  className={`french-flag ${selectedFlag === 'fr' ? 'selected' : ''}`} 
		  alt="frenchFlag svg" 
		  onClick={() => handleFlagClick('fr')}
		/>
		<img 
		  src={flagI}  
		  className={`italian-flag ${selectedFlag === 'it' ? 'selected' : ''}`} 
		  alt="italianFlag svg" 
		  onClick={() => handleFlagClick('it')}
		/>
		<img 
		  src={flagE}  
		  className={`english-flag ${selectedFlag === 'en' ? 'selected' : ''}`} 
		  alt="englishFlag svg" 
		  onClick={() => handleFlagClick('en')}
		/>
	  </div>
	);
  }

export default Languages