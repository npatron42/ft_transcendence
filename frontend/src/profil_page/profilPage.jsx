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

function profilPage() {

	return (
	<div id="background-container">
		{/* <h1 className="title">Mon Profil</h1> */}
		<Pseudo />
		<Image />
		<Bt2fa />
		<Del />
		<Upload />
		<Langue />
		<Mail />
		<Mdp  />
	</div>
  )
}

export default profilPage