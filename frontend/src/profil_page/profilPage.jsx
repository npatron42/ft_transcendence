import { useState } from 'react';;
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

function profilPage() {

	const [Actif, setActif] = useState(false);
	
	return (
	<div id="background-container">
		{/* <div className="custom-cadre-pic"></div> */}
		{/* <div className="custom-cadre-change"></div> */}
		<Upload />
		<Image />
		<Del />
		<Pseudo Actif={Actif} setActif={setActif} />
		<Mail Actif={Actif} setActif={setActif} />
		<Mdp  Actif={Actif} setActif={setActif} />
		<Bt2fa />
		<ButtonDef />
		<Langue />
	</div>
  )
}

export default profilPage