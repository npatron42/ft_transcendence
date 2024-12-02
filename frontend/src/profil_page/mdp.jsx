import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal } from 'react-bootstrap';
import { checkPass, getUser, sendPass } from '../api/api';
import { useAuth } from '../provider/UserAuthProvider';
import './mdp.css';
import './del.css';

function Mdp({Actif, setActif}) {
  const { t } = useTranslation();
  const { myUser, setUser } = useAuth();
  const [input, setInput] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [modif, setModif] = useState(false);
  const [show, setShow] = useState(false);
  const [valide, setValide] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setShow(false);
    setOldPassword('');
  };
  
  const handleShow = () => setShow(true);

  
  const handleClick = async (e) => {
    e.preventDefault();
    if (modif) {

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_\-=~.])[A-Za-z\d@$!%*?&#^_\-=~.]{8,40}$/;
			
			if (input === '') {
				setErrorMessage("registerPage.passwordRequired");
				return;
			}
			else if (!passwordRegex.test(input)) {
				setErrorMessage("registerPage.passwordInvalid");
				return;
			}

      try {
				const response = await sendPass(input);
				if (response.success) {
					setInput('');
					setModif(false);
					setActif(false);
					setValide(false);
					setErrorMessage('');
          setOldPassword('');
				} else if (response.success === false) {
					setErrorMessage("profilPage.errorPass");
				}
			} catch (error) {
			}
    } else {
      handleShow();
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await checkPass(oldPassword);
      if (response.success) {
        setModif(true);
        setActif(true);
        setValide(true);
        handleClose();  
      } else {
        alert(t('profilPage.inco'));
      }
    }catch (error) {
      alert("echoue");
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
        <p className="para3">{t("registerPage.mdp")}</p>
        <Form.Group className="input1" controlId="MDP">
          <Form.Control
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            readOnly={!modif}
            className="form-test" 
          />
        </Form.Group>
      </Form>

      {errorMessage && <p className="error-mdp">{t(errorMessage)}</p>}

      <Button variant="outline-dark" className="custom-click1" 
      onClick={handleClick} disabled={Actif && !valide || myUser.isFrom42}>
        {modif ? t("profilPage.valide") : t('profilPage.modif')}
      </Button>

      <Modal show={show}  onHide={handleClose} className="modal-custom">
        <Modal.Body className="modal-content-custom">
          <Form onSubmit={handleModalSubmit}>
            <Form.Group  className="input-check" controlId="Password">
              <Form.Label className="txt-label" >{t('profilPage.oldmdp')}</Form.Label>
              <Form.Control
                type="password"
                placeholder=""
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
				        className="form-test"/>
            </Form.Group>  
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-content-custom">

          <Button  variant="danger" className="custom-click3" onClick={handleClose}>
          {t("profilPage.cancel")}
          </Button>
          <Button variant="outline-dark" className="custom-click2" onClick={handleModalSubmit}>
            {t("profilPage.valide")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Mdp;