function FriendItem({ user, chooseStatus, deleteFriend}) {
    return (
        <tr className="friend-item">
            <td className="friend-item.td">
                <img src={user.profilePicture} alt={`${user.username}'s profile`} className="profile-picture" />
            </td>
			<td className="friend-item.td"><span  className="username">{user.username}</span></td>
			<td className="friend-item.td"><span className={`status ${chooseStatus(user.username)}`}>{chooseStatus(user.username)}</span></td>
            <td className="friend-item.td">
                    <i class="bi bi-trash3 modifyTrash2" onClick={() => deleteFriend(user)}></i>
            </td>
        </tr>
    );
}

export default FriendItem;