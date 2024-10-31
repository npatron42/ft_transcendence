import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/winComp.css';
import './css/chooseGame.css';


export const WinComp = ({ winner }) => {
    const navigate = useNavigate();
    
    const handleRematchClick = () => {
        navigate('/globalGameSolo');
    };
    
    const handleMenuClick = () => {
        navigate('/chooseGame');
    };
    return (
        <div className="WinComp">
            <div id="win-card" className="flip-card">
                <div className="flip-card-inner">
                    <div className="flip-card-front">
                        <div className="flip-card-content">
                            <p className="title2">{winner}</p>
                        </div>
                    </div>
                    <div className="flip-card-back">
                        <div className="flip-card-content">
                            <button className="start-game" onClick={handleRematchClick}>Rematch</button>
                            <button className="start-game" onClick={handleMenuClick}>Return to menu</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
