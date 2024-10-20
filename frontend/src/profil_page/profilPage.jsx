import { useState, useEffect } from 'react';;
import Langue from '../login_page/languages.jsx';
import "./utils.css"
import Bt2fa from './bt2fa.jsx';
import Image from './image.jsx';
import Del from './del.jsx';
import Upload from './upload.jsx';
import Pseudo from './pseudo.jsx';
import Mail from './mail.jsx';
import Mdp from './mdp.jsx';
import ButtonDef from './buttonDef.jsx';
import ButtonBlockedUsers from './buttonBlockedUsers.jsx';
import { useWebSocket } from '../provider/WebSocketProvider.jsx';
import { useAuth } from '../provider/UserAuthProvider.jsx';
import { getBlockedRelations2 } from '../api/api.js';

function profilPage() {

	const {myUser} = useAuth();
	const {socketUser, subscribeToMessages} = useWebSocket();
	const [Actif, setActif] = useState(false);

	const [blockedUsers, setBlockedUsers] = useState([]);

	const initBlockedUsers = async () => {
		const blockedUsersTmp = await getBlockedRelations2();
		setBlockedUsers(blockedUsersTmp)
		console.log(blockedUsersTmp)
	}

	useEffect(() => {
        initBlockedUsers();
    },[])

	useEffect(() => {
        const handleSocketUser = (data) => {
            if (data["blocked"]) {
                setBlockedUsers(data["blocked"])
				console.log("data received --> ", data["blocked"])
            }
        };
        const unsubscribeMess = subscribeToMessages(handleSocketUser);
        return () => {
            unsubscribeMess(); 
        };
    }, [subscribeToMessages, socketUser]);

	return (
	<div id="background-container">
		<Pseudo Actif={Actif} setActif={setActif} />
		<Image />
		<Bt2fa />
		<Del />
		<ButtonDef />
		<ButtonBlockedUsers blockedUsers={blockedUsers} myUser={myUser} socketUser={socketUser}/>
		<Upload />
		<Langue />
		<Mail Actif={Actif} setActif={setActif} />
		<Mdp  Actif={Actif} setActif={setActif} />
	</div>
  )
}

export default profilPage