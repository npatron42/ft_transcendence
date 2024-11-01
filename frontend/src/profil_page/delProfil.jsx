import { Button, Modal } from 'react-bootstrap';
import './utils.css';


function delProfil() {
  return (
	<div>	
		<Button 
		variant="danger" 
		className="custom-rgpd2">
			Supprimer mon profil
		</Button>
	</div>
  )
}

export default delProfil