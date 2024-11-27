import { Button } from 'react-bootstrap';
import './utils.css';
import { recupProfil } from '../api/api';
import { useTranslation } from 'react-i18next';

function recProfil({Actif}) {
	const { t } = useTranslation();

	const handelClick = async() => {
		try {
			const response = await recupProfil();
			if (response){
				const data = response.data;
				const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);

			
				const link = document.createElement('a');
				link.href = url;
				link.download = 'profil_data.json';
				link.click();
			
				URL.revokeObjectURL(url);
			}
		}
		catch(error){
			alert("error");
		}
	};

  return (
	<div>	
		<Button 
		variant="outline-dark" 
		className="custom-rgpd"
		disabled={Actif}
		onClick={handelClick}>
			{t('profilPage.recup')}
		</Button>
	</div>
  )
}

export default recProfil