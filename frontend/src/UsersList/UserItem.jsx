function UserItem({ user, handleInvitation, isInviting, chooseStatus}) {
    return (
        <tr className="friend-item">
            <td className="friend-item.td">
                <img src={user.profilePicture} alt={`${user.username}'s profile`} className="profile-picture" />
            </td>
			<td className="friend-item.td"><span  className="username">{user.username}</span></td>
			<td className="friend-item.td"><span className={`status ${chooseStatus(user.username)}`}>{chooseStatus(user.username)}</span></td>
            <td className="friend-item.td">
                <button type="button" className="btn btn-outline-dark buttonAdd" onClick={() => handleInvitation(user)}>add</button>
            </td>
        </tr>
    );
}

export default UserItem;