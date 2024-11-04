import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Form, Button } from 'react-bootstrap';
import { getUser, sendMail } from '../api/api';
import { useAuth } from '../provider/UserAuthProvider';
import './mail.css'

function mail({Actif, setActif}) {
	const { t } = useTranslation();
	const { myUser, setUser } = useAuth();
	const [input, setInput] = useState(myUser.email || '');
	const [modif, setModif] = useState(false);
	const [valide, setValide] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleClick = async () => {
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

			try {
				const response = await sendMail(input)
				if (response.success){
					const tmpUser = await getUser();
					setUser(tmpUser);
					setInput(''); 
					setModif(false);
					setActif(false);
					setValide(false);
					setErrorMessage('');
				}else if (response.success === false) {
					setErrorMessage("profilPage.errorMail");
				} else {
					console.log("marche pas");
				}
			} catch (error) {
				console.log('Failed mail');
			}
		} else {
			setInput('');
			setValide(true);
			setActif(true);
			setModif(true);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (modif) {
			handleClick();
		}
	};

	return (
		<div>
			<Form onSubmit={handleSubmit}>
				<p className="para">{t("registerPage.mail")} </p>
				<Form.Group className="input" controlId="Mail">
					<Form.Control
						type="text"
						placeholder={myUser.email}
						value={modif ? input : myUser.email}
						onChange={(e) => setInput(e.target.value)}
						readOnly={!modif}
						className="form-test"
					/>
				</Form.Group>
			</Form>

			{errorMessage && <p className="error-mail">{t(errorMessage)}</p>}

			<Button variant="outline-dark" className="custom-click" 
				onClick={handleClick}  disabled={Actif && !valide}>
				{modif ? t("profilPage.valide") : t('profilPage.modif')}
			</Button>
		</div>
	);
}

export default mail;