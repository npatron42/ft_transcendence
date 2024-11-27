import { Button, Modal } from 'react-bootstrap';
import './utils.css';
import { useTranslation } from 'react-i18next';
import { deleteProfil } from '../api/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function delProfil({Actif}) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [sup, setSup] = useState(false);
	const [show, setShow] = useState(false);

	const handleShow = () => setShow(true);
	const handleClose = () => setShow(false);

	const handleModalSup = () => {
			setSup(true);
			handleClose();
	  };

	
	  useEffect(() => {
        const handleDeleteProfile = async () => {
            if (sup) {
                try {
                    const response = await deleteProfil();
					if (response){
						localStorage.clear();
						navigate('/');
					}
                } catch (error) {
                    alert("Erreur lors de la suppression du profil :", error);
                }
            }
        };

        handleDeleteProfile();
    }, [sup, navigate]);
	  
	

  return (

	<div>	
		<Button 
		variant="danger" 
		className="custom-rgpd2"
		disabled={Actif}
		onClick={handleShow}>
			{t('profilPage.sup')}
		</Button>

		<Modal show={show}  onHide={handleClose} className="modal-custom">
        <Modal.Body className="modal-content-custom">
        </Modal.Body>
        <Modal.Footer className="modal-content-custom">

          <Button  variant="danger" className="custom-click3" onClick={handleClose}>
          {t("profilPage.cancel")}
          </Button>
          <Button variant="outline-dark" className="custom-click2" onClick={handleModalSup}>
            {t("profilPage.valide")}
          </Button>
        </Modal.Footer>
      </Modal>

	</div>
  )
}

export default delProfil