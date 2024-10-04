import React, { useRef } from 'react';
import Button from 'react-bootstrap/Button';
import "./button.css";

function Upload() {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // Ouvre le dialogue de sélection de fichier lorsque le bouton est cliqué
    fileInputRef.current.click();
  };

  return (
    <div>
      {/* Bouton personnalisé pour uploader un fichier */}
      <Button className="custom-upload" onClick={handleButtonClick}>
        Click to upload image
      </Button>
      
      {/* Champ de fichier masqué */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }} // Masquer complètement l'input
      />
    </div>
  );
}

export default Upload;
