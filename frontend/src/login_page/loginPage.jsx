import './buttonCreate.jsx';
import ButtonCreate from './buttonCreate.jsx';
import Button42 from './button42.jsx';
import Cadre from './cadre.jsx';
import Log from './idPass.jsx';
import Langue from './languages.jsx';
import { useTranslation } from 'react-i18next';
import './cadre.css';
import '../App.css'


function loginPage(){
	const { t } = useTranslation();
	
	return (
		<div id="background-container">
			<Cadre />
			<ButtonCreate />
			<Button42 />
			<h3 className="h1-titre">Transcendence</h3>
			<Log />
			<Langue />
			<p className="para-user">{t('loginPage.new')}</p>
		</div>
	);
}

export default loginPage;