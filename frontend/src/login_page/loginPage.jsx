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


function loginPage(){
	const { t } = useTranslation();
	const navigate = useNavigate();
	
	useEffect(() => {
		const token = localStorage.getItem('jwt');
		
		if (token) {
		  console.log("ok");
		  navigate('/home');
		} else {
		  console.log("pas ok");
		}
	  }, [navigate]);
	return (
		<div className="background-container">
			<Cadre />
			<ButtonCreate />
			<Button42 />
			<h3 className="h1-titre">Transcendence</h3>
			<Log />
			<Langue />
			<p className="para-user">{t('loginPage.new')}</p>
		</div>
	);
}

export default loginPage;