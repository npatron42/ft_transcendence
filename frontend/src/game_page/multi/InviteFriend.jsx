import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers, getFriendsList, getUser } from '../../api/api';
import { useAuth } from '../../provider/UserAuthProvider';
import Loading from '../../loading_page/Loading';
import { useWebSocket } from '../../provider/WebSocketProvider';
import '../css/inviteFriend.css';

function InviteFriendItem({ user, chooseStatus, roomId, socketUser, setIsInviting, isInviting }) {

    const { myUser } = useAuth();

    console.log("mes ifomations", roomId);
    const roomIdStr = roomId.roomId;
    const InviteFriendGame = () => {
        const dataToSend = {
            "type": "GameInvitation",
			"leader": myUser,
			"userInvited": user,
			"roomId": roomIdStr
		}
        console.log("InviteFriendGame", dataToSend);
        socketUser.send(JSON.stringify(dataToSend));
        setIsInviting(true);
        return;
    }

    return (
        <tr className="invite-toGame-friend-item">
            <td className="invite-toGame-friend-item.td">
                <img src={user.profilePicture} alt={`${user.username}'s profile`} className="invite-profile-picture" />
            </td>
            <td className="invite-toGame-friend-item.td"><span className={`status ${chooseStatus(user.username)}`}>{chooseStatus(user.username)}</span></td>
            <td className="invite-toGame-friend-item.td">
                <button type="button" className="btn btn-outline-dark invite-toGame-button"  onClick={() => InviteFriendGame()}>Invite</button>
            </td>
        </tr>
    );
}

export default InviteFriendItem;

export const InviteFriend = (roomId) => {
    const { socketUser } = useWebSocket();
    const [userList, setUserList] = useState([]);
    const [status, setStatus] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { myUser } = useAuth();
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        const handleSocketMessage = (message) => {
            const data = JSON.parse(message.data);
            if (data.status) {
                setStatus(data.status);
            }
        };

        if (socketUser) {
            socketUser.addEventListener("message", handleSocketMessage);
        }

        return () => {
            if (socketUser) {
                socketUser.removeEventListener("message", handleSocketMessage);
            }
        };
    }, [socketUser]);

    const defineUsersList = async () => {
        setIsLoading(true);
        const allUsers = await getAllUsers();
        const filteredUsers = allUsers.filter((user) => user.username !== myUser.username);
        setUserList(filteredUsers);
        setIsLoading(false);
    };

    const chooseStatus = (username) => {
        if (status[username] === true) {
            return "online";
        } else if (status[username] === "in-game") {
            return "in-game";
        } else {
            return "offline";
        }
    };

    useEffect(() => {
        defineUsersList();
    }, [myUser.username]);

    
    if (isInviting) {
        return;
    }

    return (
        
        <div className="invite-toGame-friends-list">
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {Array.isArray(userList) ? (
                        userList.length === 0 ? (
                            <div className="invite-noUsers">No friends found</div>
                        ) : (
                            <table className={`invite-users-list ${userList.length >= 4 ? "scroll" : ""}`}>
                                <tbody>
                                    {userList.map((user) => (
                                        <InviteFriendItem
                                            key={user.id}
                                            user={user}
                                            chooseStatus={chooseStatus}
                                            roomId={roomId}
                                            socketUser={socketUser}
                                            setIsInviting={setIsInviting}
                                            isInviting={isInviting}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        )
                    ) : (
                        <table>
                            <tbody>
                                <tr>
                                    <td colSpan="4" className="invite-noUsers">
                                        Invalid user list
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
};
