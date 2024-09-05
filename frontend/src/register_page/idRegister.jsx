import {useState} from "react"
import {Button, Form} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './registrer.css';


function idRegister() {

	const { t } = useTranslation();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleClick = (e) => {
		e.preventDefault();


		if (username === '' || password === '')
			return;

		console.log('Username ', username);
		console.log('Password ', password);
	};

	return(
		<div>
			<Form>
			<p className="id">ok</p>
				<Form.Group className="input_id" controlId="User">
					<Form.Control
					type="text"
					placeholder= "non"
					value={username}
					onChange={(e) => setUsername(e.target.value)}/>
				</Form.Group>

				<p className="mail">bro</p> 
				<Form.Group className="input_mail" variant="Dark" controlId="mail">
					<Form.Control
					type="email"
					placeholder= "oui"
					value={password}
					onChange={(e) => setPassword(e.target.value)}/>
				</Form.Group>
				 
				<p className="pass">bro</p> 
				<Form.Group className="input_pass" variant="Dark" controlId="Pass">
					<Form.Control
					type="password"
					placeholder= "oui"
					value={password}
					onChange={(e) => setPassword(e.target.value)}/>
				</Form.Group>
				<Button variant="outline-dark" className="custom-create" onClick={handleClick}>non </Button>
			</Form>
		</div>
	)
}


export default idRegister