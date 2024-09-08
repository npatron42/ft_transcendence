import {useState} from "react"
import {Button, Form} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './registrer.css';


function idRegister() {

	const { t } = useTranslation();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [errors, setErrors] = useState({});

	const handleClick = (e) => {
		e.preventDefault();

	const newErrors = {};

	const usernameRegex = /^[a-zA-Z0-9.-]{3,11}$/;
	if(username === '')
		newErrors.username = ("registerPage.idRequired");
	else if(!usernameRegex.test(username))
		newErrors.username = ("registerPage.idCara");


	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if(email === '')
		newErrors.email = ("registerPage.emailRequired");
	else if(!emailRegex.test(email))
		newErrors.email = ("registerPage.emailInvalid");

	const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
	if(password === '')
		newErrors.password = ("registerPage.passwordRequired");
	else if(!passwordRegex.test(password))
		newErrors.password = ("registerPage.passwordInvalid");



	if(Object.keys(newErrors).length > 0){
		setErrors(newErrors);
		return;
	}
		
	console.log('Username ', username);
	console.log('Password ', password);
	};

	return(
		<div>
			<Form>
			<p className="id">{t("registerPage.id")}</p>
				<Form.Group className="input_id" controlId="User">
					<Form.Control
					type="text"
					placeholder= {t("registerPage.champ1")}
					value={username}
					onChange={(e) => setUsername(e.target.value)}/>
				</Form.Group>

				<p className="mail"> {t("registerPage.mail")}</p> 
				<Form.Group className="input_mail" variant="Dark" controlId="mail">
					<Form.Control
					type="email"
					placeholder= {t("registerPage.champ2")}
					value={email}
					onChange={(e) => setEmail(e.target.value)}/>
				</Form.Group>
				 
				<p className="pass">{t("registerPage.mdp")}</p> 
				<Form.Group className="input_pass" variant="Dark" controlId="Pass">
					<Form.Control
					type="password"
					placeholder= {t("registerPage.champ3")}
					value={password}
					onChange={(e) => setPassword(e.target.value)}/>
				</Form.Group>
					
					{errors.username && <p className="error-user">{t(errors.username)}</p>}
					{errors.email && <p className="error-mail">{t(errors.email)}</p>}
					{errors.password &&<p className="error-password" dangerouslySetInnerHTML={{ __html: t(errors.password).replace(/\n/g, '<br />') }}></p>}
				<Button variant="outline-dark" className="custom-create" onClick={handleClick}>{t("registerPage.createAccount")}</Button>
			</Form>
		</div>
	)
}


export default idRegister