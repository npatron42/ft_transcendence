import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../provider/UserAuthProvider';
import { useWebSocket } from '../provider/WebSocketProvider';
import "./ModalUserChat.css"

const host = import.meta.env.VITE_HOST;

function ModalUserChat(userSelected) {
  const {myUser} = useAuth();
  const [show, setShow] = useState(false);
  const navigate = useNavigate()
  const handleClose = () => setShow(false);
  const {socketUser} = useWebSocket();

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
    console.log("Data sent --> ", myData);
    if (socketUser.OPEN) {
      socketUser.send(JSON.stringify(myData));
    }
    else {
      console.log("socket closed baby")
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
          <img src={userSelected["userSelected"].profilePicture.startsWith('https') ? userSelected["userSelected"].profilePicture : `https://${location.host}/api/media/${userSelected["userSelected"].profilePicture}`} className="profile-picture-discuss"></img>
        </div>
				<div className="inside-div-custom-modal">
          <button type="button" className="btn btn-outline-dark buttonModal" onClick={() => handleProfile()}>PROFILE</button>
				</div>
				<div className="inside-div-custom-modal">
          <button type="button" className="btn btn-outline-dark buttonModal" onClick={() => handlePlay(userSelected)}>PLAY</button>
				</div>
				<div className="inside-div-custom-modal">
          <button type="button" className="btn btn-outline-dark buttonModal" onClick={() => handleBlock()}>BLOCK</button>
				</div>
			</div>
		</Modal.Body>
      </Modal>
    </>
  );
}

export default ModalUserChat;
