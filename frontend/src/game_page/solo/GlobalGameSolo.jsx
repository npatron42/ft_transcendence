import React, { useState } from 'react';
import PongSolo from './PongSolo';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const GlobalGameSolo = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const maxScore = location.state?.maxScore || 10;
    const powerUp = location.state?.powerUp;

    // useEffect(() => {
    //     const isRefreshed = localStorage.getItem('isRefreshed');
    //     if (isRefreshed) {
    //       navigate('/home');
    //     } else {
    //       localStorage.setItem('isRefreshed', 'true');
    //     }
    //     return () => localStorage.removeItem('isRefreshed');
    //   }, [navigate]);

    return (
        <div className="GlobalGame">
            <PongSolo
                roomId={roomId}
                maxScore={maxScore}
                powerUp={powerUp}
            />
        </div>
    );
};

export default GlobalGameSolo;