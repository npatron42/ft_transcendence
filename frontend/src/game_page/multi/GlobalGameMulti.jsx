import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PongMulti from './PongMulti';
import { InviteFriend } from './InviteFriend';

const GlobalGameMulti = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const isTournament = location.state?.isTournament;
    const idTournament = location.state?.idTournament;
    const maxScore = location.state?.maxScore || 10;
    const powerUp = location.state?.powerUp;
    const mustInvite = location.state?.mustInvite || false;
    const userSelected = location.state?.userSelected;
    const navigate = useNavigate();

    // useEffect(() => {
    //     const isRefreshed = localStorage.getItem('isRefreshed');
    //     if (isRefreshed) {
    //       navigate('/home');
    //     } else {
    //       localStorage.setItem('isRefreshed', 'true');
    //     }
    //     return () => localStorage.removeItem('isRefreshed');
    //   }, [navigate]);

    
    console.log("uaerSelected", userSelected);
    return (
        <div className="GlobalGame">
            {mustInvite && (
                <InviteFriend roomId={roomId} />
            )}
            <PongMulti
                roomId={roomId}
                maxScore={maxScore}
                powerUp={powerUp}
                userSelected={userSelected}
                isTournament={isTournament}
                idTournament={idTournament}
            />
        </div>
    );
};

export default GlobalGameMulti;
