import { useNavigate } from 'react-router-dom';

const host = import.meta.env.VITE_HOST;

function UserItem({ user, handleInvitation, chooseStatus}) {

    const navigate = useNavigate();

    const handleUsernameClick = () => {
        navigate(`/profile/${user.username}`);
    };

    return (
        <tr className="friend-item">
            <td className="friend-item.td">
                <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://${host}:8000/media/${user.profilePicture}`}
                alt={`${user.username}'s profile`} className="profile-picture" />
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
                    <i className="bi bi-person-plus modifyTrash" onClick={() => handleInvitation(user)}></i>
            </td>
        </tr>
    );
}

export default UserItem;