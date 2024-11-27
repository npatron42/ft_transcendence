import { useTranslation } from 'react-i18next';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from 'react';

import './buttonBlockedUsers.css'

function buttonBlockedUsers({blockedUsers, myUser, socketUser, Actif}) {

	const { t } = useTranslation();

	const handleUnblock = (userBlocked) => {
		const dataToSend = {
			"type": "UNBLOCK",
			"userWhoBlocks": myUser,
			"userBlocked": userBlocked
		}
		if (socketUser.OPEN) {
			socketUser.send(JSON.stringify(dataToSend));
		}
		else {
		}
		return ;
	}

  return (
	<div>
    <Dropdown className="custom-dropdown-blocked">
      <Dropdown.Toggle variant="secondary custom-size"  disabled={Actif}>
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