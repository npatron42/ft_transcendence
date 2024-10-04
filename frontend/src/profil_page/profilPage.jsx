import { useTranslation } from 'react-i18next';
import Langue from '../login_page/languages.jsx';
import "./utils.css"
import Bt2fa from './bt2fa.jsx';
import Image from './image.jsx';
import Del from './del.jsx';
import Upload from './upload.jsx';

function profilPage() {
  return (
	<div id="background-container">
		{/* <h1 className="title">Mon Profil</h1> */}
		<Image />
		<Bt2fa />
		<Del />
		<Upload />
		<Langue />
	</div>
  )
}

export default profilPage