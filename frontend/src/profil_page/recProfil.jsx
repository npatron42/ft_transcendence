import { Button } from 'react-bootstrap';
import './utils.css';
import { useTranslation } from 'react-i18next';

function recProfil() {
	const { t } = useTranslation();
  return (
	<div>	
		<Button 
		variant="outline-dark" 
		className="custom-rgpd">
			{t('profilPage.recup')}
		</Button>
	</div>
  )
}

export default recProfil