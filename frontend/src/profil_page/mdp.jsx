import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import './mdp.css';
import './del.css';

function Mdp() {
  const [Mdp, setMdp] = useState('le boos');
  const [input, setInput] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [modif, setModif] = useState(false);
  const [show, setShow] = useState(false); 

  const handleClose = () => {
    setShow(false);
    setOldPassword('');
  };
  
  const handleShow = () => setShow(true);

  
  const handleClick = () => {
    if (modif) {
      setMdp(input); 
      setInput(''); 
      setModif(false);
    } else {
      handleShow();
    }
  };

  const handleModalSubmit = () => {
    if (oldPassword === Mdp) {
      setModif(true);
      handleClose();  
    } else {
      alert('Mot de passe incorrect !');
    }
  };

  return (
    <div>
      <Form>
        <p className="para3">Mot de passe actuel : </p>
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

      <Button variant="outline-dark" className="custom-click1" onClick={handleClick}>
        {modif ? 'Valider' : 'Changer'}
      </Button>

      <Modal show={show} onHide={handleClose} className="modal-custom">
        <Modal.Body className="modal-content-custom">
          <Form>
            <Form.Group  className="input-check" controlId="Password">
              <Form.Label className="txt-label" >Entrez l'ancien mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder=""
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
				className="form-test"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-content-custom">
          <Button  variant="danger" className="custom-click3" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="outline-dark" className="custom-click2" onClick={handleModalSubmit}>
            Valider
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Mdp;