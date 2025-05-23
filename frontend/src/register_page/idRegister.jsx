import {useState} from "react"
import {Button, Form} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './registrer.css';
import axios from 'axios';


const host = import.meta.env.VITE_HOST;


function idRegister() {

		const { t } = useTranslation();
		const navigate = useNavigate();
	
		const [username, setUsername] = useState('');
		const [password, setPassword] = useState('');
		const [email, setEmail] = useState('');
		const [errors, setErrors] = useState({});
	
		const handleClick = async (e) => {
			e.preventDefault();
	
		const newErrors = {};
	
		const usernameRegex = /^[a-zA-Z0-9.-]{3,11}$/;
		if(username === '')
			newErrors.username = ("registerPage.idRequired");
		else if(!usernameRegex.test(username))
			newErrors.username = ("registerPage.idCara");
	
	
		const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,64}\.[^\s@]+$/;
	
		if(email === '')
			newErrors.email = ("registerPage.emailRequired");
		else if(!emailRegex.test(email))
			newErrors.email = ("registerPage.emailInvalid");
	
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_\-=~.])[A-Za-z\d@$!%*?&#^_\-=~.]{8,40}$/;
	
		if(password === '')
			newErrors.password = ("registerPage.passwordRequired");
		else if(!passwordRegex.test(password))
			newErrors.password = ("registerPage.passwordInvalid");
	
		if(Object.keys(newErrors).length > 0){
			setErrors(newErrors);
			return;
		}
		const response = await axios.post(`https://${location.host}/api/auth/register/`, {
			username,
			email,
			password
		});
			if (response.data.success) {
				navigate('/');
			}
			else {
				if (response.data.username === false){
					newErrors.username = ("registerPage.userPris");
				}
				if (response.data.email === false){
					newErrors.email =("registerPage.mailPris");
				}
				if(Object.keys(newErrors).length > 0){
					setErrors(newErrors);
					return;
				}
			}

	};

	return(
		<div>
			<Form onSubmit={handleClick}>
			<p className="id">{t("registerPage.id")}</p>
				<Form.Group className="input_id" controlId="User">
					<Form.Control
					type="text"
					placeholder= {t("registerPage.champ1")}
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className="form-test"/>
				</Form.Group>

				<p className="mail"> {t("registerPage.mail")}</p> 
				<Form.Group className="input_mail" variant="Dark" controlId="mail">
					<Form.Control
					type="email"
					placeholder= {t("registerPage.champ2")}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="form-test"/>
				</Form.Group>
				 
				<p className="pass">{t("registerPage.mdp")}</p> 
				<Form.Group className="input_pass" variant="Dark" controlId="Pass">
					<Form.Control
					type="password"
					placeholder= {t("registerPage.champ3")}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="form-test"/>
				</Form.Group>
					
					{errors.username && <p className="error-user">{t(errors.username)}</p>}
					{errors.email && <p className="error-mail2">{t(errors.email)}</p>}
					{errors.password &&<p className="error-password" dangerouslySetInnerHTML={{ __html: t(errors.password).replace(/\n/g, '<br />') }}></p>}
				<Button type="submit" variant="outline-dark" className="custom-create" onClick={handleClick}>{t("registerPage.createAccount")}</Button>
			</Form>
		</div>
	)
}


export default idRegister