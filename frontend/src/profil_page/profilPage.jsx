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
import DelProfil from './delProfil.jsx';
import RecProfil from './recProfil.jsx';
import ButtonDef from './buttonDef.jsx';
import ButtonBlockedUsers from './buttonBlockedUsers.jsx';
import { useWebSocket } from '../provider/WebSocketProvider.jsx';
import { useAuth } from '../provider/UserAuthProvider.jsx';
import { getBlockedRelations2 } from '../api/api.js';
import NavbarBS from '../components/Navbar.jsx'

function profilPage() {

	const [Actif, setActif] = useState(false);
	const {myUser} = useAuth();
	const {socketUser, subscribeToMessages} = useWebSocket();
	const [blockedUsers, setBlockedUsers] = useState([]);

	const initBlockedUsers = async () => {
		const blockedUsersTmp = await getBlockedRelations2();
		setBlockedUsers(blockedUsersTmp)
	}

	useEffect(() => {
        initBlockedUsers();
    },[])

	useEffect(() => {
        const handleSocketUser = (data) => {
            if (data["blocked"]) {
                setBlockedUsers(data["blocked"])
            }
        };
        const unsubscribeMess = subscribeToMessages(handleSocketUser);
        return () => {
            unsubscribeMess(); 
        };
    }, [subscribeToMessages, socketUser]);
	
	return (
	<div id="background-container">
		<NavbarBS />
		<Upload Actif={Actif} />
		<Image />
		<Del Actif={Actif}/>
		<ButtonBlockedUsers blockedUsers={blockedUsers} myUser={myUser} socketUser={socketUser} Actif={Actif}/>
		<Pseudo Actif={Actif} setActif={setActif} />
		<Mail Actif={Actif} setActif={setActif} />
		<Mdp  Actif={Actif} setActif={setActif} />
		<DelProfil Actif={Actif}/>
		<Bt2fa Actif={Actif}/>
		<RecProfil Actif={Actif}/>
		<ButtonDef Actif={Actif}/>
		<Langue />
	</div>
  )
}

export default profilPage