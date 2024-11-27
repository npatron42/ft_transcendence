import './buttonCreate.jsx';
import ButtonCreate from './buttonCreate.jsx';
import Button42 from './button42.jsx';
import Cadre from './cadre.jsx';
import Log from './idPass.jsx';
import Langue from './languages.jsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import './cadre.css';
import '../App.css'


function loginPage(){
	const { t } = useTranslation();
	const navigate = useNavigate();
	
	useEffect(() => {
		const token = localStorage.getItem('jwt');
		
		if (token)
		  navigate('/home');
	  }, [navigate]);
	return (
		<div id="background-container">
			<Cadre />
			<h3 className="h1-titre">Transcendence</h3>
			<ButtonCreate />
			<Button42 />
			<Log />
			<Langue />
		</div>
	);
}

export default loginPage;