import React, { useState } from 'react';
import PongSolo from './PongSolo';
import { useLocation } from 'react-router-dom';

const GlobalGameSolo = () => {
    const location = useLocation();
    const maxScore = location.state?.maxScore || 10;

    return (
        <div className="GlobalGame">
            <PongSolo maxScore={maxScore}/>
        </div>
    );
};

export default GlobalGameSolo;