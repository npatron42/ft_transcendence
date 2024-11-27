import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../api/api';

const host = import.meta.env.VITE_HOST;

function UserItem({ user, handleInvitation, chooseStatus}) {

    const navigate = useNavigate();

    const handleUsernameClick = () => {
        navigate(`/profile/${user.username}`);
    };

    return (
        <tr className="friend-item">
            <td className="friend-item.td">
                <img src={getMediaUrl(user.profilePicture)}
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
			<td className="friend-item.td"><span className={`status ${chooseStatus(user.id)}`}>{chooseStatus(user.id)}</span></td>
            <td className="friend-item.td">
                    <i className="bi bi-person-plus modifyTrash" onClick={() => handleInvitation(user)}></i>
            </td>
        </tr>
    );
}

export default UserItem;