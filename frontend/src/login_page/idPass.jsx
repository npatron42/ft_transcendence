import React, { useState, useEffect } from 'react';
import {Button, Form} from 'react-bootstrap';
import { getUser } from '../api/api';
import { useTranslation } from 'react-i18next';
import './cadre.css';
import '../register_page/registrer.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function idPass() {

	const { t } = useTranslation();
	const navigate = useNavigate();


	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState("");

	const handleClick = async (e) => {
		e.preventDefault();

		
		if (username === "" || password === "" 
			|| username.includes("_") || password.includes("_")) {
			setErrorMessage('loginPage.error');
			return;
			}
		
		try {
			const response = await axios.post('http://localhost:8000/auth/login/', {
    			username,
   			 	password
			});
				if (response.data.success) {
                	localStorage.setItem('jwt', response.data.token);
					sessionStorage.removeItem('i18nextLng');
					const user = await getUser();
    				const userLangue = user.langue;
    				localStorage.setItem('i18nextLng', userLangue);
                	navigate('/home');
            	} else {
                	setErrorMessage('loginPage.error');
            	}
        	} catch (error) {
            	console.log("Une erreur est survenue lors de la connexion.");
        	}
    	
	};

	return(
		<div>
			<Form>
			<p className="para-id">{t('loginPage.id')}</p>
				<Form.Group className="input-id" controlId="formUser">
					<Form.Control
					type="text"
					placeholder={t('loginPage.champ1')}
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className="form-test" />
				</Form.Group>
				 
				<p className="para-login">{t('loginPage.mdp')}</p> 
				<Form.Group className="input-pass" variant="Dark" controlId="formPassword">
					<Form.Control
					type="password"
					placeholder={t('loginPage.champ2')}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="form-test" />
				</Form.Group>

				{errorMessage && <p className="error">{t(errorMessage)}</p>}
				
				<Button variant="outline-dark" className="custom-log" onClick={handleClick}> {t('loginPage.login')} </Button>
			</Form>
		</div>
	)
}


export default idPass