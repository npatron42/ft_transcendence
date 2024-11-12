import React, { useEffect, useState } from 'react';
import '../css/gameSettings.css';
import { useWebSocket } from '../../provider/WebSocketProvider';
import { useAuth } from '../../provider/UserAuthProvider';
import { getGameSettings, updateGameSettings } from '../../api/api';

const GameSettings = () => {
    const { websocketUser } = useWebSocket();
    const { myUser } = useAuth();
    const [gameSettings, setGameSettings] = useState();
    const [keyBind, setKeyBind] = useState({ up: "w", down: "s" });

    useEffect(() => {
        (async () => {
            try {
                const settings = await getGameSettings();
                setGameSettings(settings);
                setKeyBind({ up: settings.up, down: settings.down });
            } catch (error) {
                console.error("Erreur lors du chargement des paramètres du jeu :", error);
            }
        })();
    }, []);

    const handleSaveSettings = async () => {
        try {
            const updatedSettings = {
                up: keyBind.up,
                down: keyBind.down,
                paddleSkin: gameSettings.paddleSkin,
            };
            await updateGameSettings(updatedSettings);
            console.log("updatedSettings", updatedSettings);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des paramètres du jeu :", error);
        }
    };

    const handleKeyBindClick = (key) => {
        document.addEventListener("keydown", (event) => {
            if (key === "up") {
                setKeyBind({ up: event.key, down: keyBind.down });
            } else {
                setKeyBind({ up: keyBind.up, down: event.key });
            }
        });
    };

    if (!gameSettings) {
        return <div>Loading...</div>;
    }

    return (
        <div className="gameSettingsGlobalContainer">
            <div className="gameSettingsContainer">
                <h1>Game Settings</h1>
                <div className="gameSettings">
                    <div className="keyBindContainer">
                        <h2>Key Bind</h2>


                        <section class="container">
                            <label>
                                <input type="checkbox" name="check" onClick={() => handleKeyBindClick("up")} />
                                <span></span>
                                <p>{keyBind.up}</p>
                            </label>
                        </section>
                        <section class="container">
                            <label>
                                <input type="checkbox" name="check"   onClick={() => handleKeyBindClick("down")} />
                                <span></span>
                                <p>{keyBind.down}</p>
                            </label>
                        </section>
                        </div>


                        <div className="paddleSkinContainer">
                            <h2>Paddle Skin</h2>
                            <input
                                type="text"
                                placeholder="Paddle Skin"
                                value={gameSettings.paddleSkin}
                                onChange={(e) => setGameSettings({ ...gameSettings, paddleSkin: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        className="buttonSaveSettings"
                        onClick={handleSaveSettings}
                    >
                        Save Settings
                    </button>
                </div>
            </div>
            );
};

            export default GameSettings;
