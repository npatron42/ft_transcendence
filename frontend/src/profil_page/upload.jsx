import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/Button';
import "./button.css";

function Upload() {

  const { t } = useTranslation();


  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <Button size="sm" variant="outline-dark" className="custom-upload" onClick={handleButtonClick}>
      {t('profilPage.upload')}</Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default Upload;
