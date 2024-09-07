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

	if(username === '')
		newErrors.username = ("registerPage.idRequired");
	else if(username.includes('_'))
		newErrors.username = ("registerPage.idNoUnderscore");
	else if(username.length > 9 )
		newErrors.username = ("registerPage.idlength");


	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if(email === '')
		newErrors.email = ("registerPage.emailRequired");
	else if(!emailRegex.test(email))
		newErrors.email = ("registerPage.emailInvalid");

	if(password === '')
		newErrors.password = ("registerPage.passwordRequired");
	else if(password.length < 8)
		newErrors.password = ("registerPage.passwordMinLength");


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
					{errors.username && <p>{t(errors.username)}</p>}
				</Form.Group>

				<p className="mail"> {t("registerPage.mail")}</p> 
				<Form.Group className="input_mail" variant="Dark" controlId="mail">
					<Form.Control
					type="email"
					placeholder= {t("registerPage.champ2")}
					value={email}
					onChange={(e) => setEmail(e.target.value)}/>
					{errors.email && <p>{t(errors.email)}</p>}
				</Form.Group>
				 
				<p className="pass">{t("registerPage.mdp")}</p> 
				<Form.Group className="input_pass" variant="Dark" controlId="Pass">
					<Form.Control
					type="password"
					placeholder= {t("registerPage.champ3")}
					value={password}
					onChange={(e) => setPassword(e.target.value)}/>
					{errors.password && <p>{t(errors.password)}</p>}
				</Form.Group>
				<Button variant="outline-dark" className="custom-create" onClick={handleClick}>{t("registerPage.createAccount")}</Button>
			</Form>
		</div>
	)
}


export default idRegister