import { useTranslation } from 'react-i18next';
import Cadre from './cadre.jsx';
import IdRegister from './idRegister.jsx';
import Langue from '../login_page/languages.jsx';

function registerPage(){
	const { t } = useTranslation();
	
	return (
		<div className="background-container">
			<Cadre/>
			<IdRegister />
			<Langue />
		</div>
	);
}

export default registerPage;