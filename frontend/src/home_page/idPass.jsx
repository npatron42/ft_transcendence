import {useState} from "react"
import {Button, Form} from 'react-bootstrap';
import './cadre.css';


function idPass() {

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
			<p className="para-id">Identifiant :</p>
				<Form.Group className="input-id" controlId="formUser">
					<Form.Control
					type="text"
					placeholder="Entrez votre identifiant"
					value={username}
					onChange={(e) => setUsername(e.target.value)}/>
				</Form.Group>
				 
				<p className="para-login">Mot de passe :</p> 
				<Form.Group className="input-pass" variant="Dark" controlId="formPassword">
					<Form.Control
					type="password"
					placeholder="Entrez votre mot de passe"
					value={password}
					onChange={(e) => setPassword(e.target.value)}/>
				</Form.Group>
				<Button variant="outline-dark" className="custom-log" onClick={handleClick}> Connexion </Button>
			</Form>
		</div>
	)
}


export default idPass