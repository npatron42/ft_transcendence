import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/Button';
import Cadre from './cadre.jsx';
import IdRegister from './idRegister.jsx';
import Langue from '../login_page/languages.jsx';
import "./registrer.css"

function registerPage(){
	const { t } = useTranslation();
	
	return (
		<div className="background-container">
			<Cadre/>
			<h1 className="h1_titre">{t("registerPage.createAccount")}</h1>
			<IdRegister />
			<Langue />
			<p className="para-I">{t("registerPage.Ihave")}</p>
			<Button href="/"  variant="outline-dark" className="custom-co"> {t("registerPage.login")}</Button>
		</div>
	);
}

export default registerPage;