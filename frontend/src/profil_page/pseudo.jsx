import { useState } from "react";
import { Form, Button } from 'react-bootstrap';
import './pseudo.css'

function Pseudo() {
	const [pseudo, setPseudo] = useState('Mon profil');
	const [input, setInput] = useState('');
	const [modif, setModif] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleClick = () => {
		
		if (modif) {
			const usernameRegex = /^[a-zA-Z0-9.-]{3,11}$/;
			
			if (input === '') {
				setErrorMessage('stop');
				return;
			}
	
			else if (!usernameRegex.test(input)) {
				setErrorMessage( "registerPage.idCara");
				return;
			}
				setPseudo(input); 
				setInput(''); 
				setModif(false);
				setErrorMessage('');
			} else {
			setModif(true);
		}
	}


	return (
		<div>
			<Form>
				<p className="para-ps">ok </p>
				<Form.Group className="input-ps" controlId="User">
					<Form.Control
						type="text"
						placeholder={pseudo}
						value={modif ? input : pseudo}
						onChange={(e) => setInput(e.target.value)}
						readOnly={!modif}
						className="form-test" 
					/>
				</Form.Group>
			</Form>
			
			{errorMessage && <p className="error">{errorMessage}</p>}
			
			<Button variant="outline-dark" className="custom-pseudo"   onClick={handleClick}>
				{modif ? 'Valider' : 'Changer'}
			</Button>
		</div>
	);
}

export default Pseudo;