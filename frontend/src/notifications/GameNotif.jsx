function GameNotif({ myUser, declineGameInvitation, acceptGameInvitation}) {
    return (
        <tr className="invite-item">
            <td className="invite-item.td">
                <img src={myUser.profilePicture} alt={`${myUser.username}'s profile`} className="profile-picture-notif" />
            </td>
			<td className="invite-item.td"><span  className="username-friendNotif">{myUser.username}</span></td>
            <td className="invite-item.td">
			<i className="bi bi-check-lg buttonAccept" onClick={() => acceptGameInvitation(myUser)}></i>
            </td>
			<td className="invite-item.td">
			<i className="bi bi-x buttonDecline" onClick={() => declineGameInvitation(myUser)}></i>
            </td>
        </tr>
    );
}

export default GameNotif;