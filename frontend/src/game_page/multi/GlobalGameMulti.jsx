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

    return (
        <div className="GlobalGame">
            <PongMulti
                roomId={roomId}
                maxScore={maxScore}
                powerUp ={powerUp}
                userSelected= {userSelected}
                isTournament={isTournament}
                idTournament={idTournament}
            />
        </div>
    );
};

export default GlobalGameMulti;
