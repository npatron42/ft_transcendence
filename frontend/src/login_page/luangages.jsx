import flagF from '../assets/login_page/frenchFlag.svg';
import flagI from '../assets/login_page/italianFlag.svg';
import flagE from '../assets/login_page/englishFlag.svg';
import React, { useState } from 'react';
import './cadre.css';


function luangages() {
	
	const [selectedFlag, setSelectedFlag] = useState(null);
	
	const handleFlagClick = (flag) => {
	  setSelectedFlag(flag);
	};
	
	return (
	  <div>
		<img 
		  src={flagF} 
		  className={`french-flag ${selectedFlag === 'french' ? 'selected' : ''}`} 
		  alt="frenchFlag svg" 
		  onClick={() => handleFlagClick('french')}
		/>
		<img 
		  src={flagI}  
		  className={`italian-flag ${selectedFlag === 'italian' ? 'selected' : ''}`} 
		  alt="italianFlag svg" 
		  onClick={() => handleFlagClick('italian')}
		/>
		<img 
		  src={flagE}  
		  className={`english-flag ${selectedFlag === 'english' ? 'selected' : ''}`} 
		  alt="englishFlag svg" 
		  onClick={() => handleFlagClick('english')}
		/>
	  </div>
	);
  }

export default luangages