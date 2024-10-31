import React, { useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { getUser } from '../api/api';
import { useTranslation } from 'react-i18next';
import './cadre.css';
import '../register_page/registrer.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function IdPass() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(''); // État pour stocker l'OTP
    const [showOtpModal, setShowOtpModal] = useState(false); // État pour afficher le modal OTP
    const [errorMessage, setErrorMessage] = useState("");

    const handleShowOtpModal = () => setShowOtpModal(true);
    const handleCloseOtpModal = () => setShowOtpModal(false);

    const handleClick = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await axios.post('http://localhost:8000/auth/login/', {
                username,
                password
            });
            if (response.data.success) {
                
                if (!response.data.token)
                    handleShowOtpModal();
                
                
                else {
                    localStorage.setItem('jwt', response.data.token);
                    sessionStorage.removeItem('i18nextLng');
                    
                    const user = await getUser();
                    const userLangue = user.langue;
                    
                    localStorage.setItem('i18nextLng', userLangue);
                    navigate('/home');
                }

            } else {
                setErrorMessage('loginPage.error');
            }
        } catch (error) {
            console.log("Une erreur est survenue lors de la connexion.");
        } finally {
            setIsLoading(false); 
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("usersane == ",  username)
            console.log("otp == ", otp)
            const response = await axios.post('http://localhost:8000/auth/verif/', {
                otp,
                username
            });

            if (response.data.success) {
                localStorage.setItem('jwt', response.data.token);
                sessionStorage.removeItem('i18nextLng');
                
                handleCloseOtpModal();

                setOtp('')
                
                const user = await getUser();
                const userLangue = user.langue;

                localStorage.setItem('i18nextLng', userLangue);

                navigate('/home');
            } else {
                console.log("test du otp", response.data.noValid)
                setOtp('');
                if (response.data.noValid === true)
                    alert(t('loginPage.errorOtpExp'))
                else    
                    alert(t('loginPage.errorOtp'))
            }
        } catch (error) {
            console.log("Une erreur est survenue lors de la vérification de l'OTP.");
        }
    };

    return (
        <div>
            <Form onSubmit={handleClick}>
                <p className="para-id">{t('loginPage.id')}</p>
                <Form.Group className="input-id" controlId="formUser">
                    <Form.Control
                        type="text"
                        placeholder={t('loginPage.champ1')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={30} 
                        className="form-test" />
                </Form.Group>

                <p className="para-login">{t('loginPage.mdp')}</p> 
                <Form.Group className="input-pass" controlId="formPassword">
                    <Form.Control
                        type="password"
                        placeholder={t('loginPage.champ2')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength={30} 
                        className="form-test" />
                </Form.Group>

                {errorMessage && <p className="error">{t(errorMessage)}</p>}

                <Button type="submit" variant="outline-dark" className="custom-log" onClick={handleClick} disabled={isLoading}>
                {isLoading ? ( <Spinner size="sm"/>) : (t('loginPage.login'))}
                </Button>
            </Form>

            <Modal show={showOtpModal} onHide={handleCloseOtpModal} className="modal-custom-otp">
				<Modal.Body className="modal-content-custom">
					<Form onSubmit={handleOtpSubmit}>
                    <Form.Group className="input-check"  controlId="formOtp">
                        <Form.Label className="txt-label">{t('loginPage.enterOtp')}</Form.Label>
                        <Form.Control
                            type="text"
                            style={{width: '18vw'}}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={30}
							className="form-test"/>
                    </Form.Group>
					</Form>
                </Modal.Body>
                <Modal.Footer className="modal-content-custom">

                    <Button variant="danger" className="custom-click3" onClick={handleCloseOtpModal}>
                        {t('profilPage.cancel')}
                    </Button>
                    <Button type="submit" variant="outline-dark" className="custom-click2" onClick={handleOtpSubmit}>
                        {t('profilPage.valide')}
                    </Button>
                    <p className="otp-message">{t('loginPage.errorOtp1')}</p>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default IdPass;