import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/chooseGame.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // Pour générer un identifiant unique

const ChooseGame = () => {
    const navigate = useNavigate();

    const handleMultiClick = () => {
        const roomId = uuidv4(); // Génère un identifiant unique pour la room
        navigate(`/GlobalGameMulti/${roomId}`);
    };

    return (
        <div id="ChooseGame">
            <div className="Solo">
                <a id="SoloButton" href="/GlobalGameSolo">Solo</a>
            </div>
            <div className="Multi">
                <button id="MultiButton" onClick={handleMultiClick}>Multi</button> {/* Bouton qui redirige */}
            </div>
        </div>
    );
};

export default ChooseGame;
