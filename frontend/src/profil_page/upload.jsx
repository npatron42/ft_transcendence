import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../provider/UserAuthProvider';
import { postPicture } from '../api/api';
import axios from 'axios';
import { getUser } from '../api/api';
import "./button.css";

function Upload() {

  const { t } = useTranslation();
  const {myUser, setUser} = useAuth()

  const fileInputRef = useRef(null);
  
  const handleButtonClick = () => {
    console.log(myUser.id);
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
      handleUpload(event.target.files[0]);
  };

  const handleUpload = async (selectedFile) => {

    const formData = new FormData();
    formData.append('profilPicture', selectedFile);
    try {
      const response = await postPicture(formData)
      if (response)
        {
          alert('Upload successful!');
          const tmpUser = await getUser();
          setUser(tmpUser);
          console.lg(myUser);
        }
        
      } catch (error) {
        alert('Failed to upload the image.');
      }

      return ;
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
        accept="image/*"

      />
    </div>
  );
}

export default Upload;
