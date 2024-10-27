import { useNavigate } from 'react-router-dom';

function FriendItem({ user, chooseStatus, deleteFriend }) {

    const navigate = useNavigate();

    const handleUsernameClick = () => {
        navigate(`/profile/${user.username}`);
    };

    return (
        <tr className="friend-item">
            <td className="friend-item.td">
                <img src={user.profilePicture} alt={`${user.username}'s profile`} className="profile-picture" />
            </td>
            <td className="friend-item.td">
                <span
                    className="username"
                    onClick={handleUsernameClick}
                    style={{ cursor: 'pointer' }}
                >
                    {user.username}
                </span>
            </td>
            <td className="friend-item.td"><span className={`status ${chooseStatus(user.username)}`}>{chooseStatus(user.username)}</span></td>
            <td className="friend-item.td">
                <button type="button" className="btn btn-outline-dark buttonAdd" onClick={() => deleteFriend(user)}>del</button>
            </td>
        </tr>
    );
}

export default FriendItem;