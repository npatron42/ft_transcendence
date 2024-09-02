import {useState} from "react"
import './buttonCreate.jsx';
import ButtonCreate from './buttonCreate.jsx';
import Button42 from './button42.jsx';
import Image from "./Image.jsx";
import Cadre from './cadre.jsx';
import './cadre.css';



function homePage(){
	return (
		<div className="background-container">
			<Cadre />
			<ButtonCreate />
			<Button42 />
			<h3 className="h1-titre">Transcendence</h3> 
			<p className="para-login">Mot de passe :</p>
			<p className="para-id">Identifiant :</p>
			<p className="para-co">Se connecter</p>
			<p className="para-user">Nouvel utilisateur ?</p> 
			<a href="https://openclassrooms.com/fr/" className="para-mdp"> Mot de passe oublié</a>
		</div>
	);
}

export default homePage;