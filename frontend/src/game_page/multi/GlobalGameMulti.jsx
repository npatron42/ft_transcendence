import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import PongMulti from './PongMulti';

const GlobalGameMulti = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const maxScore = location.state?.maxScore || 10;

    return (
        <div className="GlobalGame">
            <PongMulti
                roomId={roomId}
                maxScore={maxScore}
                
            />
        </div>
    );
};

export default GlobalGameMulti;
