function UserItem({ user, handleInvitation, chooseStatus}) {
    return (
        <tr className="friend-item">
            <td className="friend-item.td">
                <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://c1r1p3:8000/media/${user.profilePicture}`}
                alt={`${user.username}'s profile`} className="profile-picture" />
            </td>
			<td className="friend-item.td"><span  className="username">{user.username}</span></td>
			<td className="friend-item.td"><span className={`status ${chooseStatus(user.username)}`}>{chooseStatus(user.username)}</span></td>
            <td className="friend-item.td">
                    <i className="bi bi-person-plus modifyTrash" onClick={() => handleInvitation(user)}></i>
            </td>
        </tr>
    );
}

export default UserItem;