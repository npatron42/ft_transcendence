import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal } from 'react-bootstrap';
import './mdp.css';
import './del.css';

function Mdp() {
  const { t } = useTranslation();

  const [Mdp, setMdp] = useState('le boos');
  const [input, setInput] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [modif, setModif] = useState(false);
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setShow(false);
    setOldPassword('');
  };
  
  const handleShow = () => setShow(true);

  
  const handleClick = () => {
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
      setMdp(input); 
      setInput(''); 
      setModif(false);
      setErrorMessage('');
    } else {
      handleShow();
    }
  };

  const handleModalSubmit = () => {
    if (oldPassword === Mdp) {
      setModif(true);
      handleClose();  
    } else {
      alert(t('profilPage.inco'));
    }
  };

  return (
    <div>
      <Form>
        <p className="para3">{t("registerPage.mdp")}</p>
        <Form.Group className="input1" controlId="MDP">
          <Form.Control
            type="password"
            placeholder="Entrez le mot de passe"
            value={modif ? input : Mdp}
            onChange={(e) => setInput(e.target.value)}
            readOnly={!modif}
            className="form-test" 
          />
        </Form.Group>
      </Form>

      {errorMessage && <p className="error-mdp">{t(errorMessage)}</p>}

      <Button variant="outline-dark" className="custom-click1" onClick={handleClick} /*disabled={!modif}*/>
        {modif ? t("profilPage.valide") : t('profilPage.modif')}
      </Button>

      <Modal show={show} onHide={handleClose} className="modal-custom">
        <Modal.Body className="modal-content-custom">
          <Form>
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