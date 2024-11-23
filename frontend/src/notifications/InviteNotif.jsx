import "./notifs.css"

const host = import.meta.env.VITE_HOST;

function InviteItem({ myUser, declineInvitation, acceptInvitation}) {
    return (
        <tr className="invite-item">
            <td className="invite-item.td">
                <img src={myUser.profilePicture.startsWith('http') ? myUser.profilePicture : `https://${host}:8000/media/${myUser.profilePicture}`} alt={`${myUser.username}'s profile`} className="profile-picture-notif" />
            </td>
			<td className="invite-item.td"><span  className="username-friendNotif">{myUser.username}</span></td>
            <td className="invite-item.td">
			<i className="bi bi-check-lg buttonAccept" onClick={() => acceptInvitation(myUser)}></i>
            </td>
			<td className="invite-item.td">
			<i className="bi bi-x buttonDecline" onClick={() => declineInvitation(myUser)}></i>
            </td>
        </tr>
    );
}

export default InviteItem;