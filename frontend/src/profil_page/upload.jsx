import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../provider/UserAuthProvider';
import { postPicture, getUser } from '../api/api';
import './button.css';

function Upload({ Actif }) {
  const { t } = useTranslation();
  const { myUser, setUser } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleButtonClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (selectedFile && !validTypes.includes(selectedFile.type)) {
      setErrorMessage(t('profilPage.errorUpload'));
      setSuccessMessage('');
      clearMessages();
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 Mo
    if (selectedFile && selectedFile.size > maxSize) {
      setErrorMessage(t('profilPage.errorUpload'));
      setSuccessMessage('');
      clearMessages();
      return;
    }

    validateImage(selectedFile)
      .then(() => handleUpload(selectedFile))
      .catch(() => {
        setErrorMessage(t('profilPage.errorUpload'));
        setSuccessMessage('');
        clearMessages();
      });
  };

  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => resolve();
      img.onerror = () => reject();
    });
  };

  const handleUpload = async (selectedFile) => {
    const formData = new FormData();
    formData.append('profilPicture', selectedFile);

    try {
      const response = await postPicture(formData);
      if (response) {
        setSuccessMessage('profilPage.succesUpload');
        setErrorMessage('');
        const tmpUser = await getUser();
        setUser(tmpUser);
      }
    } catch (error) {
      setSuccessMessage('');
      setErrorMessage('profilPage.errorUpload');
    }
    clearMessages();
  };

  const clearMessages = () => {
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  return (
    <div>
      <Button
        size="sm"
        variant="outline-dark"
        className="custom-upload"
        onClick={handleButtonClick}
        disabled={Actif}
      >
        {t('profilPage.upload')}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".jpg, .jpeg, .png, .svg"
      />
      {successMessage && <p className="succes-upload">{t(successMessage)}</p>}
      {errorMessage && <p className="error-upload">{t(errorMessage)}</p>}
    </div>
  );
}

export default Upload;
