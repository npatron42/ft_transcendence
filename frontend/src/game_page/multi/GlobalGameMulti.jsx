import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import PongMulti from './PongMulti';
import { InviteFriend } from './InviteFriend';

const GlobalGameMulti = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const maxScore = location.state?.maxScore || 10;
    const powerUp = location.state?.powerUp;

    return (
        <div className="GlobalGame">
            <InviteFriend/>
            <PongMulti
                roomId={roomId}
                maxScore={maxScore}
                powerUp ={powerUp}
            />
        </div>
    );
};

export default GlobalGameMulti;
