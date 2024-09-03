import {useState} from "react"
import './buttonCreate.jsx';
import ButtonCreate from './buttonCreate.jsx';
import Button42 from './button42.jsx';
import Image from "./Image.jsx";
import Cadre from './cadre.jsx';
import Log from './idPass.jsx';
import Button from 'react-bootstrap/Button';
import './cadre.css';


function homePage(){
	return (
		<div className="background-container">
			<Cadre />
			<ButtonCreate />
			<Button42 />
			<h3 className="h1-titre">Transcendence</h3>
			<Log />
			<p className="para-user">Nouvel utilisateur ?</p> 
		</div>
	);
}

export default homePage;