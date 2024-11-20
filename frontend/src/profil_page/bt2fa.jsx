import "./button.css"
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../provider/UserAuthProvider';
import { getUser} from '../api/api';
import { toggle2fa } from '../api/api';

function bt2fa() {
	const { t } = useTranslation();
	const {myUser, setUser} = useAuth();
	
	console.log(myUser.dauth);

	const handleChange = async() => {
		try {
			await toggle2fa(!myUser.dauth);
			const tmpUser = await getUser();
			setUser(tmpUser);
			if (!myUser.dauth)
				alert(t('profilPage.good2fa'))
			// console.log("je vaux mtn", myUser.dauth);
		} catch {
			// alert("error actif 2fa");
			console.log("error actif 2fa");
		}
	};
  return (
	<div>
		<Button 
		variant="outline-dark"
		className="custom-2fA" 
		onClick={handleChange}
		disabled={myUser.isFrom42}>
			{myUser.dauth ? 
			t('profilPage.disable2fa') : t('profilPage.enable2fa')}
		</Button>
	</div>
  );
}

export default bt2fa