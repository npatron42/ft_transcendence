import React, { useEffect, useState } from 'react';
import '../css/gameSettings.css';
import { useWebSocket } from '../../provider/WebSocketProvider';
import { useAuth } from '../../provider/UserAuthProvider';
import { getGameSettings, updateGameSettings } from '../../api/api';
import MiniPong from './MiniPong';

const Carousel = ({ items, currentItem, onSelectItem, type }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!items) {
        return <div>Loading...</div>;
    }

    const handleNext = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % items.length;
            onSelectItem(items[nextIndex].name, type);
            return nextIndex;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            const prevIndexTmp = (prevIndex - 1 + items.length) % items.length;
            onSelectItem(items[prevIndexTmp].name, type);
            return prevIndexTmp;
        });
    };

    return (
        <div className="carouselContainer">
            <button onClick={handlePrev} className="carouselButton">Prev</button>
            <div className="carouselContent">
                <div
                    className={`carouselItem ${items[currentIndex].className}`}
                    style={items[currentIndex].style}
                ></div>
                <div className="itemName">{items[currentIndex].name}</div>
            </div>
            <button onClick={handleNext} className="carouselButton">Next</button>
        </div>
    );
};


const GameSettings = () => {
    const { myUser } = useAuth();
    const [gameSettings, setGameSettings] = useState();
    const [keyBind, setKeyBind] = useState({ up: "w", down: "s" });

    const paddleSkin = [
        { name: 'Classic', className: 'classicSkin', style: { backgroundColor: '#ffffff' }},
        { name: 'Neon', className: 'neonSkin', style: { backgroundColor: '#00FF00' }},
        { name: 'Fire', className: 'fireSkin', style: { backgroundColor: '#FF4500' }},
    ];

    const ballSkin = [
        { name: 'Blue', className: 'blueBall', style: { backgroundColor: '#0000FF' } },
        { name: 'Red', className: 'redBall', style: { backgroundColor: '#FF0000' } },
        { name: 'Green', className: 'greenBall', style: { backgroundColor: '#00FF00' } },
    ];

    const boardSkin = [
        { name: 'Black', className: 'blackBoard', style: { backgroundColor: '#000000' } },
        { name: 'Gray', className: 'grayBoard', style: { backgroundColor: '#808080' } },
        { name: 'White', className: 'whiteBoard', style: { backgroundColor: '#FFFFFF' } },
    ];

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
                ballColor: gameSettings.ballColor,
                boardColor: gameSettings.boardColor,
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

    const handleSelectItem = (itemName, type) => {
        setGameSettings({ ...gameSettings, [type]: itemName });
    };

    if (!gameSettings) {
        return <div>Loading...</div>;
    }

    return (
        <div className="gameSettingsGlobalContainer">
            <div className="gameSettingsContainer">
                <div className="gameSettings">
                    <div className="leftContainer">
                        <div className="miniPongContainer">
                            <MiniPong />
                        </div>
                        <div className="keyBindContainer">
                            <div className="sectionHeader">
                                <h2>Key Bind</h2>
                            </div>
                            <section className="container">
                                <label>
                                    <input type="checkbox" name="check" onClick={() => handleKeyBindClick("up")} />
                                    <span> <i className="bi bi-caret-up-square"></i> {keyBind.up}</span>
                                </label>
                            </section>
                            <section className="container">
                                <label>
                                    <input type="checkbox" name="check" onClick={() => handleKeyBindClick("down")} />
                                    <span> <i className="bi bi-caret-down-square"></i> {keyBind.down}</span>
                                </label>
                            </section>
                        </div>
                    </div>
                    <div className="SkinContainer">
                        <div className="sectionHeader">
                            <h2>Skin</h2>
                        </div>
                    <div className="PaddleSkinContainer">
                        <Carousel
                            items={paddleSkin}
                            currentSkin={gameSettings.paddleSkin}
                            onSelectItem={handleSelectItem}
                            type="paddleSkin"
                        />
                    </div>

                    <div className="BallSkinContainer">
                        <div className="sectionHeader">
                            <h2>Ball Color</h2>
                        </div>
                        <Carousel
                            items={ballSkin}
                            currentItem={gameSettings.ballSkin}
                            onSelectItem={handleSelectItem}
                            type="ballSkin"
                        />
                    </div>

                    <div className="BoardSkinContainer">
                        <div className="sectionHeader">
                            <h2>Board Color</h2>
                        </div>
                        <Carousel
                            items={ boardSkin}
                            currentItem={gameSettings.boardSkin}
                            onSelectItem={handleSelectItem}
                            type="boardSkin"
                        />
                    </div>
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
