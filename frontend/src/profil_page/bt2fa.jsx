import "./button.css"
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';

function bt2fa() {
	const { t } = useTranslation();
  return (
	<div>
		<Button variant="outline-dark" className="custom-2fA">{t('profilPage.2fa')} </Button></div>
  );
}

export default bt2fa