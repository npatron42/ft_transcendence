import { useEffect, useState } from 'react'
import "./notifs.css"
import { getNotifs } from '../src/api/api';
import { useWebSocket } from '../src/provider/WebSocketProvider';

function Notifications() {
	const [myInviteNotifs, setInviteNotifs] = useState({});
	const { subscribeToNotifs } = useWebSocket();
  
	useEffect(() => {
	  const handleNotif = (data) => {
		console.log("NOTIFICATIONS --> ", data);
		const InviteNotifTmp = data["friendsInvitations"];
		setInviteNotifs(InviteNotifTmp);
		console.log(InviteNotifTmp);
	  };
  
	  const unsubscribe = subscribeToNotifs(handleNotif);
  
	  const initNotifs = async () => {
		const myData = await getNotifs();
		setInviteNotifs(myData["friendsInvitations"]);
	  };
  
	  initNotifs();
  
	  return () => {
		unsubscribe();
	  };
	}, [subscribeToNotifs]);



  return (
    <div className="notifications">
		<button></button>
    </div>
  );
}

export default Notifications