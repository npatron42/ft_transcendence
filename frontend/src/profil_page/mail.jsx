import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Form, Button } from 'react-bootstrap';
import './mail.css'

function mail() {
	const { t } = useTranslation();

	const [Mail, setMail] = useState('mon mail');
	const [input, setInput] = useState('');
	const [modif, setModif] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleClick = () => {
		if (modif) {
			const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,64}\.[^\s@]+$/;
			
			if (input === '') {
				setErrorMessage("registerPage.emailRequired");
				return;
			}
			else if (!emailRegex.test(input)) {
				setErrorMessage("registerPage.emailInvalid");
				return;
			}
				setMail(input); 
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
				<p className="para">{t("registerPage.mail")} </p>
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

			{errorMessage && <p className="error-mail">{t(errorMessage)}</p>}

			<Button variant="outline-dark" className="custom-click" onClick={handleClick}>
				{modif ? t("profilPage.valide") : t('profilPage.modif')}
			</Button>
		</div>
	);
}

export default mail;