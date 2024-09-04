import './buttonCreate.jsx';
import ButtonCreate from './buttonCreate.jsx';
import Button42 from './button42.jsx';
import Cadre from './cadre.jsx';
import Log from './idPass.jsx';
import Langue from './luangages.jsx';
import './cadre.css';


function loginPage(){
	return (
		<div className="background-container">
			<Cadre />
			<ButtonCreate />
			<Button42 />
			<h3 className="h1-titre">Transcendence</h3>
			<Log />
			<Langue />
			<p className="para-user">Nouvel utilisateur ?</p> 
		</div>
	);
}

export default loginPage;