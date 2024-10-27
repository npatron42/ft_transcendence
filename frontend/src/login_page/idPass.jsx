import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { getUser } from '../api/api';
import { useTranslation } from 'react-i18next';
import './cadre.css';
import '../register_page/registrer.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function IdPass() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(''); // État pour stocker l'OTP
    const [showOtpModal, setShowOtpModal] = useState(false); // État pour afficher le modal OTP
    const [errorMessage, setErrorMessage] = useState("");

    const handleShowOtpModal = () => setShowOtpModal(true);
    const handleCloseOtpModal = () => setShowOtpModal(false);

    const handleClick = async (e) => {
        e.preventDefault();

        if (username === "" || password === "" 
            || username.includes("_") || password.includes("_")) {
            setErrorMessage('loginPage.error');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/auth/login/', {
                username,
                password
            });
            if (response.data.success) {
                localStorage.setItem('jwt', response.data.token);
                sessionStorage.removeItem('i18nextLng');
                const user = await getUser();
                const userLangue = user.langue;

                if (user.dauth)
                    handleShowOtpModal(); // Afficher le modal OTP
                
				// navigate('/home'); // Rediriger vers la page d'accueil si 2FA n'est pas nécessaire

                localStorage.setItem('i18nextLng', userLangue);
            } else {
                setErrorMessage('loginPage.error');
            }
        } catch (error) {
            console.log("Une erreur est survenue lors de la connexion.");
        }
    };

    const handleOtpSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:8000/auth/verify_otp/', {
                otp
            });

            if (response.data.success) {
                handleCloseOtpModal(); // Fermer le modal
                navigate('/home'); // Rediriger vers la page d'accueil
            } else {
                setErrorMessage('loginPage.invalidOtp'); // Gérer les erreurs d'OTP
            }
        } catch (error) {
            console.log("Une erreur est survenue lors de la vérification de l'OTP.");
        }
    };

    return (
        <div>
            <Form>
                <p className="para-id">{t('loginPage.id')}</p>
                <Form.Group className="input-id" controlId="formUser">
                    <Form.Control
                        type="text"
                        placeholder={t('loginPage.champ1')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-test" />
                </Form.Group>

                <p className="para-login">{t('loginPage.mdp')}</p> 
                <Form.Group className="input-pass" controlId="formPassword">
                    <Form.Control
                        type="password"
                        placeholder={t('loginPage.champ2')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-test" />
                </Form.Group>

                {errorMessage && <p className="error">{t(errorMessage)}</p>}

                <Button variant="outline-dark" className="custom-log" onClick={handleClick}>
                    {t('loginPage.login')}
                </Button>
            </Form>

            <Modal show={showOtpModal} onHide={handleCloseOtpModal}>
				<Modal.Body className="modal-content-custom">
					<Form>
                    <Form.Group className="input-check"  controlId="formOtp">
                        <Form.Label>{t('profilPage.enterOtp')}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={t('profilPage.otpPlaceholder')}
                            onChange={(e) => setOtp(e.target.value)}
							className="form-test"
                        />
                    </Form.Group>
					</Form>
                </Modal.Body>
                <Modal.Footer className="modal-content-custom">

                    <Button variant="danger" className="custom-click3" onClick={handleCloseOtpModal}>
                        {t('profilPage.cancel')}
                    </Button>
                    <Button variant="outline-dark" className="custom-click2" onClick={handleOtpSubmit}>
                        {t('profilPage.valide')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default IdPass;
