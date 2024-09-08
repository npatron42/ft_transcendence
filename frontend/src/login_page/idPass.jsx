import React, { useState, useEffect } from 'react';
import {Button, Form} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './cadre.css';


function idPass() {

	const { t } = useTranslation();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState("");

	const handleClick = (e) => {
		e.preventDefault();

		
		if (username === "" || password === "") {
			setErrorMessage('loginPage.error');
			return;
			}

		setErrorMessage(""); 
		console.log('Username ', username);
		console.log('Password ', password);
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
					onChange={(e) => setUsername(e.target.value)}/>
				</Form.Group>
				 
				<p className="para-login">{t('loginPage.mdp')}</p> 
				<Form.Group className="input-pass" variant="Dark" controlId="formPassword">
					<Form.Control
					type="password"
					placeholder={t('loginPage.champ2')}
					value={password}
					onChange={(e) => setPassword(e.target.value)}/>
				</Form.Group>

				{errorMessage && <p className="error">{t(errorMessage)}</p>}
				
				<Button variant="outline-dark" className="custom-log" onClick={handleClick}> {t('loginPage.login')} </Button>
			</Form>
		</div>
	)
}


export default idPass