import { useState } from "react";
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../provider/UserAuthProvider';
import { useTranslation } from 'react-i18next';
import './pseudo.css'

function Pseudo({Actif, setActif}) {

	const { t } = useTranslation();

	const {myUser, setUser} = useAuth();
	const [input, setInput] = useState('');
	const [modif, setModif] = useState(false);
	const [valide, setValide] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleClick = () => {
		
		if (modif) {
			const usernameRegex = /^[a-zA-Z0-9.-]{3,11}$/;
			
			if (input === '') {
				setErrorMessage("registerPage.idRequired");
				return;
			}
	
			else if (!usernameRegex.test(input)) {
				setErrorMessage("registerPage.idCara");
				return;
			}
				setPseudo(input); 
				setInput(''); 
				setModif(false);
				setActif(false);
				setValide(false);
				setErrorMessage('');
			} else {
			setValide(true);
			setActif(true);
			setModif(true);
		}
	}

	return (
		<div>
			<Form>
				<p className="para-ps">{t("registerPage.id")}</p>
				<Form.Group className="input-ps" controlId="User">
					<Form.Control
						type="text"
						placeholder={myUser.username}
						value={modif ? input : myUser.username}
						onChange={(e) => setInput(e.target.value)}
						readOnly={!modif}
						className="form-test" 
					/>
				</Form.Group>
			</Form>
			
			{errorMessage && <p className="error-pseudo">{t(errorMessage)}</p>}
			
			<Button variant="outline-dark" className="custom-pseudo" 
			onClick={handleClick}  disabled={Actif && !valide}>
				{modif ? t("profilPage.valide") : t('profilPage.modif')}
			</Button>
		</div>
	);
}

export default Pseudo;