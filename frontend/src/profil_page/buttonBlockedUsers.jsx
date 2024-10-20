import { useTranslation } from 'react-i18next';
import Dropdown from 'react-bootstrap/Dropdown';
import flagI from '../assets/login_page/italianFlag.svg';
import flagE from '../assets/login_page/englishFlag.svg';
import flagF from '../assets/login_page/frenchFlag.svg';
import { getBlockedRelations2 } from '../api/api';
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useAuth } from '../provider/UserAuthProvider';

import './buttonBlockedUsers.css'

function buttonBlockedUsers({blockedUsers, myUser, socketUser}) {

	const { t } = useTranslation();

	const handleUnblock = (userBlocked) => {
		const dataToSend = {
			"type": "UNBLOCK",
			"userWhoBlocks": myUser,
			"userBlocked": userBlocked
		}
		socketUser.send(JSON.stringify(dataToSend));
		return ;
	}

  return (
	<div>
    <Dropdown className="custom-dropdown-blocked">
      <Dropdown.Toggle variant="secondary custom-size">
		<span >{t('profilPage.blocked')}</span>
      </Dropdown.Toggle>
	  	<Dropdown.Menu>
			<Dropdown.Item>
				{blockedUsers.length === 0 && (
				<span className="modifyUsername">...</span>
				)}
				{blockedUsers.length !== 0 && (
				<div className="test">
					{blockedUsers.map((userBlocked) => (
					<div key={userBlocked.username} className="blockedUser-item">
						<div className="blockedUser-item-username">
						<span className="modifyUsername">{userBlocked.username}</span>
						</div>
						<div className="blockedUser-item-cross" onClick={() => handleUnblock(userBlocked)}>
						<i className="bi bi-x-lg modifyCross"></i>
						</div>
					</div>
					))}
				</div>
				)}
			</Dropdown.Item>
		</Dropdown.Menu>
    </Dropdown>
	<p className="def-langue">{t('profilPage.lg')} </p>
	</div>
  );
}

export default buttonBlockedUsers;