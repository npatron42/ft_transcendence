import Button from 'react-bootstrap/Button';
import "./button.css"
import { useTranslation } from 'react-i18next';

function buttonCreate() {
  const { t } = useTranslation();
  return (
    <div>
    <Button href="/register" size="sm" variant="outline-dark" className="custom-button">{t('loginPage.createAccount')}</Button>
  </div>
  );
}

export default buttonCreate;
