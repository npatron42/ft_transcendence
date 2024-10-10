import { useState } from "react";
import { Form, Button } from 'react-bootstrap';
import './mdp.css'

function mdp() {
	const [Mdp, setMdp] = useState('mon mail');
	const [input, setInput] = useState('');
	const [modif, setModif] = useState(false); 
	const handleClick = () => {
		if (modif) {
			setMdp(input); 
			setInput(''); 
			setModif(false); 
		} else {
			setModif(true);
		}
	}

	return (
		<div>
			<Form>
				<p className="para1">bro </p>
				<Form.Group className="input1" controlId="MDP">
					<Form.Control
						type="password"
						placeholder={''}
						value={modif ? input : Mdp}
						onChange={(e) => setInput(e.target.value)}
						readOnly={!modif}
						className="form-test" 
					/>
				</Form.Group>
			</Form>
			<Button variant="outline-dark" className="custom-click1" onClick={handleClick}>
				{modif ? 'Valider' : 'Changer'}
			</Button>
		</div>
	);
}

export default mdp;