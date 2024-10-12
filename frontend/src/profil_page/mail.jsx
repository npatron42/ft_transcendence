import { useState } from "react";
import { Form, Button } from 'react-bootstrap';
import './mail.css'

function mail() {
	const [Mail, setMail] = useState('mon mail');
	const [input, setInput] = useState('');
	const [modif, setModif] = useState(false); 
	const handleClick = () => {
		if (modif) {
				setMail(input); 
				setInput(''); 
				setModif(false);
		} else {
			setModif(true);
		}
	}

	return (
		<div>
			<Form>
				<p className="para">moi </p>
				<Form.Group className="input" controlId="Mail">
					<Form.Control
						type="text"
						placeholder={Mail}
						value={modif ? input : Mail}
						onChange={(e) => setInput(e.target.value)}
						readOnly={!modif}
						className="form-test"
					/>
				</Form.Group>
			</Form>
			<Button variant="outline-dark" className="custom-click" onClick={handleClick}>
				{modif ? 'Valider' : 'Changer'}
			</Button>
		</div>
	);
}

export default mail;