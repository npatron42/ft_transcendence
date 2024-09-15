function FriendItem({ user, handleInvitation, isInviting, chooseStatus}) {
    return (
        <tr className="friend-item">
            <td>
                <img src={user.profilePicture} alt={`${user.username}'s profile`} className="profile-picture" />
            </td>
			<td><span  className="username">{user.username}</span></td>
			<td><span className={`status ${chooseStatus(user.username)}`}>{chooseStatus(user.username)}</span></td>
            <td>
				<i className="bi bi-person-check icon_checked"></i>
				{/* <button type="button" class="btn btn-outline-dark"                    onClick={() => handleInvitation(user)}
                    className="btn btn-primary btn-sm"
                    disabled={isInviting}
                >
                    {isInviting ? "Inviting..." : "Add"}
                </button> */}
            </td>
        </tr>
    );
}

export default FriendItem;
<button type="button" class="btn btn-outline-dark">Dark</button>