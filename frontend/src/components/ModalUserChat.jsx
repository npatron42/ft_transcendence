import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../provider/UserAuthProvider';
import { useWebSocket } from '../provider/WebSocketProvider';
import "./ModalUserChat.css"
import { useTranslation } from 'react-i18next';

const host = import.meta.env.VITE_HOST;

function ModalUserChat(userSelected) {
  const {myUser} = useAuth();
  const [show, setShow] = useState(false);
  const navigate = useNavigate()
  const handleClose = () => setShow(false);
  const {socketUser} = useWebSocket();
  const { t } = useTranslation();

  useEffect(() => {
    setShow(true);
  }, []);

  const handleProfile = () => {
    const link = "/profile/" + userSelected["userSelected"].username;
    navigate(link);
    return ;
  }

  const handlePlay = (userSelected) => {
    const user = userSelected["userSelected"]
    navigate("/game/options", {state: { user }});
    return ;
  }

  const handleBlock = () => {
    const myData = {
      "type": "BLOCK",
      "userWhoBlocks": myUser,
      "userBlocked": userSelected["userSelected"],
    }
    if (socketUser.OPEN) {
      socketUser.send(JSON.stringify(myData));
    }
    if (show === true)
      setShow(false);
    return ;
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} className="custom-modal" >
        <Modal.Body className="modal-body-custom">
			<div className="div-custom-modal">
				<div className="inside-div-custom-modal">
          <img src={userSelected["userSelected"].profilePicture.startsWith('http') ? userSelected["userSelected"].profilePicture : `http://${host}:8000/media/${userSelected["userSelected"].profilePicture}`} className="profile-picture-discuss"></img>
        </div>
				<div className="inside-div-custom-modal">
          <button type="button" className="btn btn-outline-dark buttonModal" onClick={() => handleProfile()}>{t('chat.profile')}</button>
				</div>
				<div className="inside-div-custom-modal">
          <button type="button" className="btn btn-outline-dark buttonModal" onClick={() => handlePlay(userSelected)}>{t('chat.play')}</button>
				</div>
				<div className="inside-div-custom-modal">
          <button type="button" className="btn btn-outline-dark buttonModal" onClick={() => handleBlock()}>{t('chat.block')}</button>
				</div>
			</div>
		</Modal.Body>
      </Modal>
    </>
  );
}

export default ModalUserChat;
