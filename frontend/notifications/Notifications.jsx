import { useEffect, useState } from 'react'
import "./notifs.css"
import { getNotifs } from '../src/api/api';
import { useWebSocket } from '../src/provider/WebSocketProvider';
import { useAuth } from '../src/provider/UserAuthProvider';
import Loading from '../src/loading_page/Loading';
import InviteItem from './InviteNotif';
import GameNotif from './GameNotif';

function Notifications() {
	const {myUser} = useAuth();
	const {socketUser} = useWebSocket();
	const [inviteNotifShown, setInviteNotifShown] = useState(true);
	const [isLoading, setIsLoading] = useState(true);
	const [gameNotifShown, setGameNotifShown] = useState(false);

	const [myInviteNotifs, setInviteNotifs] = useState(null);
	const [myGameNotifs, setGameNotifs] = useState(null);

	const { subscribeToNotifs } = useWebSocket();

	useEffect(() => {
		const handleNotif = (data) => {
			const InviteNotifTmp = data["friendsInvitations"];
			setInviteNotifs(InviteNotifTmp);
		};

		const unsubscribe = subscribeToNotifs(handleNotif);

		const initNotifs = async () => {
			setIsLoading(true)
			const myData = await getNotifs();
			setInviteNotifs(myData["friendsInvitations"]);
			setGameNotifs(myData["gameInvitations"]);
			setIsLoading(false)
		};

		initNotifs();

		return () => {
			unsubscribe();
		};
	}, [subscribeToNotifs]);

	const handleInviteNotifShown = () => {
		setInviteNotifShown(!inviteNotifShown);
		if (gameNotifShown === true)
			setGameNotifShown(false);
	}

	const handleGameNotifShown = () => {
		setGameNotifShown(!gameNotifShown);
		if (inviteNotifShown === true)
			setInviteNotifShown(false);
	}

	const declineInvitation = (myUser) => {
		console.log("DECLINE")
	}

    const acceptInvitation = (userInvited) => {
		console.log(socketUser)
        if (socketUser && socketUser.readyState === WebSocket.OPEN) {
			console.log("MyUser.username --> ", myUser.username);
			console.log("userInvited --> ", userInvited);
            const data = {
                type: "INVITE",
                invitationFrom: myUser.username,
                to: userInvited.username,
                parse: myUser.username + "|" + userInvited.username
            };
            socketUser.send(JSON.stringify(data));
        } else {
            console.log("WebSocket for invitations is not open");
        }
    };

	return (
		<div className="notifications">
			{isLoading ? (
                <Loading />
            ) : (
            <>
			<div className="center-div">
				<h4 onClick={() => handleInviteNotifShown()}
				type="button"
				className={`btn btn-outline-dark ButtonNotif ${inviteNotifShown ? 'active' : ''}`}>
				Friends
				</h4>
				<h4 onClick={() => handleGameNotifShown()}
				type="button"
				className={`btn btn-outline-dark ButtonNotif ${gameNotifShown ? 'active' : ''}`}>
				Game
				</h4>
			</div>
			{inviteNotifShown ? (
			<div>
			{myInviteNotifs.length === 0 ? (
			  <div className="noNotif">No invitations...</div>
			) : (
				<div className={`inviteList ${myInviteNotifs.length >= 3 ? 'scroll' : ''}`}>
					{myInviteNotifs.map((user) => (
					<InviteItem
						key={user.id}
						myUser={user}
						declineInvitation={declineInvitation}
						acceptInvitation={acceptInvitation}
					/>
					))}
				</div>
			)}
		  	</div>
			) : (
			<div>
				{myGameNotifs.length === 0 ? (
					<div colSpan="4" className="noNotif">No invitations...</div>
				) : (
				myGameNotifs.map((user) => (
					<GameNotif
					key={user.id}
					myUser={user}
					declineInvitation={declineInvitation}
					acceptInvitation={acceptInvitation}
					/>
				))
				)}
			</div>
			)}
			</>
		)};
	</div>
	);
}
export default Notifications