import React from 'react';
import '../css/gameSettings.css';
import { useEffect, useState } from 'react';
import { useWebSocket } from '../../provider/WebSocketProvider';
import { useAuth } from '../../provider/UserAuthProvider';
import { getGameSettings, updateGameSettings } from '../../api/api';

const GameSettings = () => {

    const {websocketUser} = useWebSocket();
    const {myUser} = useAuth();
    const [GameSettings, setGameSettings] = useState();

    console.log("myUser", myUser);
    console.log("GameSettings", GameSettings); 

    useEffect(() => {
        (async () => {
            try {
                const settings = await getGameSettings();
                setGameSettings(settings);
            } catch (error) {
                console.error("Erreur lors du chargement des paramètres du jeu :", error);
            }
        })();
    }, []);

    let settings = {
        keyBind : "p,d",
        paddleSkin : "paddle1",
    };
    
    useEffect(() => {
        if (settings) {
            (async () => {
                try {
                    await updateGameSettings(settings);
                    console.log("Paramètres mis à jour avec succès");
                } catch (error) {
                    console.error("Erreur lors de la mise à jour des paramètres du jeu :", error);
                }
            })();
        }
    }, [settings]);
    



    return (
        <div className="gameSettingsContainer">
            <h1>Game Settings</h1>
        </div>
    );
}

export default GameSettings;