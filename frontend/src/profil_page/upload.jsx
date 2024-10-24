import React, { useRef , useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../provider/UserAuthProvider';
import { postPicture } from '../api/api';
import axios from 'axios';
import { getUser } from '../api/api';
import "./button.css";

function Upload() {

  const { t } = useTranslation();
  const {myUser, setUser} = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  
  const handleButtonClick = () => {
    // console.log(myUser.id);
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

    handleUpload(selectedFile);
  };

  const handleUpload = async (selectedFile) => {

    const formData = new FormData();
    formData.append('profilPicture', selectedFile);
    try {
      const response = await postPicture(formData)
      if (response)
        {
          setSuccessMessage('profilPage.succesUpload');
          setErrorMessage(''); 
          const tmpUser = await getUser();
          setUser(tmpUser);
          // console.log(" in response : ", myUser);
          
        }
        
      } catch (error) {
        // alert("tes");
        setSuccessMessage('');
        setErrorMessage('profilPage.errorUpload');
        // alert('Failed to upload the image.');
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
      <Button size="sm" variant="outline-dark" className="custom-upload" onClick={handleButtonClick}>
      {t('profilPage.upload')}</Button>
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
