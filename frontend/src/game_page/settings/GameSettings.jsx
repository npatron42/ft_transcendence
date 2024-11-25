import React, { useEffect, useState } from 'react';
import '../css/gameSettings.css';
import '../css/miniPong.css';
import { useWebSocket } from '../../provider/WebSocketProvider';
import { useAuth } from '../../provider/UserAuthProvider';
import { getGameSettings, updateGameSettings } from '../../api/api';
import { MiniPong } from './MiniPong';
import { useTranslation } from 'react-i18next';

const Carousel = ({ className, initialIndex = 0, onSelectItem, type }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    if (!className) {
        return <div id="background-container">
            <div className="loader">
            </div>
        </div>
    }

    const handleNext = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % className.length;
            onSelectItem(className[nextIndex].className, type);
            return nextIndex;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            const prevIndexTmp = (prevIndex - 1 + className.length) % className.length;
            onSelectItem(className[prevIndexTmp].className, type);
            return prevIndexTmp;
        });
    };

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    return (
        <div className="carouselContainer">
            <button onClick={handlePrev} className="carouselButtonRight">
                <i className="bi bi-caret-left-square-fill"></i>
            </button>
            <div className="carouselContent">
                <div
                    className={`carouselItem ${className[currentIndex].className}`}
                    style={className[currentIndex].style}
                ></div>
            </div>
            <button onClick={handleNext} className="carouselButtonLeft">
                <i className="bi bi-caret-right-square-fill"></i>
            </button>
        </div>
    );
};

const GameSettings = () => {
    const { myUser } = useAuth();
    const [gameSettings, setGameSettings] = useState();
    const [keyBind, setKeyBind] = useState({ up: "w", down: "s" });
    const [isCheckedUp, setIsCheckedUp] = useState(false);
    const [isCheckedDown, setIsCheckedDown] = useState(false);
    const { t } = useTranslation();

    const paddleSkin = [
        { className: 'defaultPaddle' },
        { className: 'radientPaddle' },
        { className: 'neonPaddle' },
        { className: 'redPaddle' },
        { className: 'glassPaddle' },
        { className: 'firePaddle' },
    ];

    const ballSkin = [
        { className: 'defaultBall' },
        { className: 'radientBall' },
        { className: 'neonBall' },
        { className: 'oldBall' },
        { className: 'pingPongBall' },
        { className: 'glassBall' },
    ];

    const boardSkin = [
        { className: 'defaultBoard' },
        { className: 'oldBoard' },
        { className: 'pingPongBoard' },
        { className: 'npatronBoard' },
        { className: 'galaxyBoard' },
        { className: 'retroGridBoard' },
        { className: 'gradientBoard' },
        { className: 'ballBoard' },
        { className: 'ball2Board' },
    ];

    const findIndex = (skins, selectedClass) =>
        skins.findIndex((skin) => skin.className === selectedClass);

    useEffect(() => {
        (async () => {
            try {
                const settings = await getGameSettings();
                setGameSettings(settings);
                setKeyBind({ up: settings.up, down: settings.down });
            } catch (error) {
                console.error("Erreur :", error);
            }
        })();
    }, []);

    const handleSaveSettings = async () => {
        try {
            const updatedSettings = {
                up: keyBind.up,
                down: keyBind.down,
                paddleSkin: gameSettings.paddleSkin,
                ballSkin: gameSettings.ballSkin,
                boardSkin: gameSettings.boardSkin,
            };
            await updateGameSettings(updatedSettings);
        } catch (error) {
            console.error("Erreur :", error);
        }
    };

    const handleKeyBindClick = (key) => {
        document.addEventListener("keydown", (event) => {
            if (key === "up") {
                if (!checkKey(event.key)) {
                    return;
                }
                if (event.key != keyBind.down) {
                    setKeyBind({ up: event.key, down: keyBind.down });
                }
                else {
                    return;
                }
                setIsCheckedUp(false);
            } else {
                if (!checkKey(event.key)) {
                    return;
                }
                if (event.key != keyBind.up) {
                    setKeyBind({ up: keyBind.up, down: event.key });
                }
                else {
                    return;
                }
                setIsCheckedDown(false);
            }
        });
    };

    const handleSelectItem = (className, type) => {
        setGameSettings({ ...gameSettings, [type]: className });
    };

    if (!gameSettings) {
        return <div id="background-container">
            <div className="loader">
            </div>
        </div>
    }

    const checkKey = (key) => {
        const allowedKeys = [
            "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
            ...Array.from("abcdefghijklmnopqrstuvwxyz"),
            ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
            ...Array.from("0123456789"),
        ];
        return allowedKeys.includes(key);
    };


    return (
        <div className="gameSettingsGlobalContainer">
            <div className="gameSettingsContainer">
                <div className="gameSettings">
                    <div className="leftContainer">
                        <div className="miniPongContainer">
                            <MiniPong
                                paddleSkin={gameSettings.paddleSkin}
                                boardSkin={gameSettings.boardSkin}
                                ballSkin={gameSettings.ballSkin}
                            />
                        </div>
                        <div className="keyBindContainer">
                            {/* <div className="sectionHeader">
                                <h2>Key Bind</h2>
                            </div> */}
                            <section className="container">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="check"
                                        checked={isCheckedUp}
                                        onChange={() => {
                                            setIsCheckedUp(true);
                                            handleKeyBindClick("up");
                                        }}
                                    />
                                    <span>
                                        <i className="bi bi-caret-up-square"></i> {keyBind.up}
                                    </span>
                                </label>
                            </section>
                            <section className="container">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="check"
                                        checked={isCheckedDown}
                                        onChange={() => {
                                            setIsCheckedDown(true);
                                            handleKeyBindClick("down");
                                        }}
                                    />
                                    <span>
                                        <i className="bi bi-caret-down-square"></i> {keyBind.down}
                                    </span>
                                </label>
                            </section>
                        </div>
                    </div>
                    <div className="SkinContainer">
                        {/* <div className="sectionHeader">
                            <h2>Skin</h2>
                        </div> */}
                        <div className="paddleSkinContainer">
                            <Carousel
                                className={paddleSkin}
                                initialIndex={findIndex(paddleSkin, gameSettings.paddleSkin)}
                                onSelectItem={handleSelectItem}
                                type="paddleSkin"
                            />
                        </div>
                        <div className="ballSkinContainer">
                            <Carousel
                                className={ballSkin}
                                initialIndex={findIndex(ballSkin, gameSettings.ballSkin)}
                                onSelectItem={handleSelectItem}
                                type="ballSkin"
                            />
                        </div>
                        <div className="boardSkinContainer">
                            <Carousel
                                className={boardSkin}
                                initialIndex={findIndex(boardSkin, gameSettings.boardSkin)}
                                onSelectItem={handleSelectItem}
                                type="boardSkin"
                            />
                        </div>
                    </div>
                </div>
                <button
                    className="createJoinButton"
                    onClick={handleSaveSettings}>
                    {t('gameSettings.save')}
                </button>
            </div>
        </div>
    );
};

export default GameSettings;
