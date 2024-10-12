import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers, getFriendsList, getNotifs, getUser } from '../../api/api';
import { useAuth } from '../../provider/UserAuthProvider';
import Loading from '../../loading_page/Loading';
import { useWebSocket } from '../../provider/WebSocketProvider';
import '../css/inviteFriend.css';

function InviteFriendItem({ user, chooseStatus}) {
  return (
      <tr className="invite-friend-item">
          <td className="invite-friend-item.td">
              <img src={user.profilePicture} alt={`${user.username}'s profile`} className="invite-profile-picture" />
          </td>
    <td className="invite-friend-item.td"><span className={`status ${chooseStatus(user.username)}`}>{chooseStatus(user.username)}</span></td>
          <td className="invite-friend-item.td">
              <button type="button" className="btn btn-outline-dark invite-buttonAdd" onClick={() => console.log("je tivite")}>Invite</button>
          </td>
      </tr>
  );
}

export default InviteFriendItem;

export const InviteFriend = () => {
    const { socketUser, subscribeToMessages, subscribeToStatus } = useWebSocket();
    const [socketMessage, setSocketMessage] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const{myUser} = useAuth();

    useEffect(() => {
        const handleSocketUser = (data) => {
            if (data["friends"]) {
                setFriendsList(data["friends"]);
            }
        };

        const handleStatus = (data) => {
            setSocketMessage(data["status"]);
        };

        const unsubscribeMess = subscribeToMessages(handleSocketUser);
        const unsubscribeStatus = subscribeToStatus(handleStatus);
        return () => {
            unsubscribeMess();
            unsubscribeStatus();
        };
    }, [subscribeToMessages, subscribeToStatus]);

    const defineFriendsList = async () => {
        setIsLoading(true);
        const myFriendsList = await getFriendsList();
        setFriendsList(myFriendsList);
        setIsLoading(false);
    };

    const chooseStatus = (username) => {
        console.log(socketMessage);
        if (socketMessage[username] === true)
          return ("online")
        return ("offline")
    };

    useEffect(() => {
        defineFriendsList();
    }, [myUser.username]);

    return (
        <div className="invite-friends-list">
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <div className="invite-center-container">
                    </div>
                    <div>
                        {Array.isArray(friendsList) ? (
                            friendsList.length === 0 ? (
                                <div className="invite-noUsers">No friends found</div>
                            ) : (
                                <table className={`invite-users-list ${friendsList.length >= 4 ? 'scroll' : ''}`}>
                                    <tbody>
                                        {friendsList.map((user) => (
                                            <InviteFriendItem 
                                                key={user.id} 
                                                user={user} 
                                                chooseStatus={chooseStatus}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )
                        ) : (
                            <table>
                                <tbody>
                                    <tr>
                                        <td colSpan="4" className="invite-noUsers">Invalid user list</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

