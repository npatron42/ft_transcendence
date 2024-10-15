import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

import "./ModalUserChat.css"

function ModalUserChat(userSelected) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  useEffect(() => {
    setShow(true);
  }, []);

  console.log(userSelected["userSelected"].username)

  return (
    <>
      <Modal show={show} onHide={handleClose} className="custom-modal" >
        <Modal.Body className="modal-body-custom">
			<div className="div-custom-modal">
				<div className="inside-div-custom-modal">
                    <img src={userSelected["userSelected"].profilePicture} className="profile-picture-discuss"></img>
                </div>
				<div className="inside-div-custom-modal">
					PROFILE
				</div>
				<div className="inside-div-custom-modal">
					BLOCK
				</div>
			</div>
		</Modal.Body>
      </Modal>
    </>
  );
}

export default ModalUserChat;
