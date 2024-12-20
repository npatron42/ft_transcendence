import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import WaitingTournaments from './WaitingTournaments';

const GlobalGameTournaments = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const maxScore = location.state?.maxScore || 10;
    const powerUp = location.state?.powerUp;

    return (
        <div className="GlobalGame">
            <WaitingTournaments
                
                roomId={roomId}
                maxScore={maxScore}
                powerUp={powerUp}
                
            />
        </div>
    );
};

export default GlobalGameTournaments;
