import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers, getFriendsList, getUser } from '../../api/api';
import { useAuth } from '../../provider/UserAuthProvider';
import Loading from '../../loading_page/Loading';
import { getMediaUrl } from '../../api/api';
import { useWebSocket } from '../../provider/WebSocketProvider';
import '../css/inviteFriend.css';
import { useTranslation } from 'react-i18next';

function InviteFriendItem({ user, chooseStatus, roomId, socketUser, setIsInviting, isInviting }) {

    const { myUser } = useAuth();
    const roomIdStr = roomId.roomId;
    const { t } = useTranslation();

    const InviteFriendGame = () => {
        const dataToSend = {
          "type": "GameInvitation",
          "leader": myUser,
          "userInvited": user,
          "roomId": roomIdStr
		    }
        socketUser.send(JSON.stringify(dataToSend));
        setIsInviting(true);
        return;
    }
    return (
        <tr className="invite-toGame-friend-item">
            <td className="invite-toGame-friend-item.td">
            <img src={getMediaUrl(user.profilePicture)} alt={`${user.username}'s profile`} className="invite-profile-picture" />
            </td>
        <td className="invite-toGame-friend-item.td"><span className={`status ${chooseStatus(user.id)}`}>{chooseStatus(user.id)} </span></td>
            <td className="invite-toGame-friend-item.td">
                <button type="button" className="btn btn-outline-dark invite-toGame-button"  onClick={() => InviteFriendGame()}>{t('chooseGame.invite')}</button>
            </td>
        </tr>
    );
}

export default InviteFriendItem;

export const InviteFriend = (roomId) => {
    const {socketUser, subscribeToStatus} = useWebSocket();
    const { myUser } = useAuth();
    const [userList, setUserList] = useState([]);
    const [status, setStatus] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const { t } = useTranslation();
  
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

    useEffect(() => {

      const handleStatus = (data) => {
          setStatus(data["status"]);
      }

      const unsubscribeStatus = subscribeToStatus(handleStatus);

      return () => {
          unsubscribeStatus();
      };
  }, [subscribeToStatus]);


  const chooseStatus = (id) => {
      if (status[id] === true)
          return ("online")
      else if (status[id] === "in-game")
          return ("in-game")
      return ("offline")
  };
  
    const defineUsersList = async () => {
      setIsLoading(true);
      const allUsers = await getAllUsers();
      const filteredUsers = allUsers.filter((user) => user.id !== myUser.id);
      setUserList(filteredUsers);
      setIsLoading(false);
    };
  
    useEffect(() => {
      defineUsersList();
    }, [myUser.username]);
  
    if (isInviting) {
      return null;
    }
  
    return (
      <div className="invite-toGame-container">
        <div className="invite-toGame-friends-list">
          {isLoading ? (
            <Loading />
          ) : userList.length === 0 ? (
            <div className="invite-noUsers">{t('chat.noUser')}</div>
          ) : (
            <div className="invite-toGame-scroll-container">
              <table
                className={`invite-users-list ${userList.length >= 4 ? "scroll" : ""}`}
              >
                <tbody>
                  {userList.map((user) => (
                    <InviteFriendItem
                      key={user.id}
                      user={user}
                      chooseStatus={chooseStatus}
                      roomId={roomId}
                      socketUser={socketUser}
                      setIsInviting={setIsInviting}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
    };