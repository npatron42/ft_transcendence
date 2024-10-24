import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PongMulti from './PongMulti';
import { InviteFriend } from './InviteFriend';

const GlobalGameMulti = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const maxScore = location.state?.maxScore || 10;
    const powerUp = location.state?.powerUp;
    const navigate = useNavigate();

    useEffect(() => {
        const isRefreshed = localStorage.getItem('isRefreshed');
        if (isRefreshed) {
          navigate('/home');
        } else {
          localStorage.setItem('isRefreshed', 'true');
        }
        return () => localStorage.removeItem('isRefreshed');
      }, [navigate]);

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
