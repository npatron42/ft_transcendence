import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../provider/WebSocketProvider'
import { useTournamentSocket } from '../../provider/TournamentSocketProvider';
import { useAuth } from '../../provider/UserAuthProvider'
import '../css/waitTournaments.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const WaitingTournaments = () => {
    const { myUser } = useAuth();
    const { socketUser } = useWebSocket();
    const { tournamentSocket } = useTournamentSocket();
    const location = useLocation();
    const myJwt = localStorage.getItem("jwt");
    const idTournament = location.state?.idTournament;
    const navigate = useNavigate()

    useEffect(() => {

        const isRefreshed = localStorage.getItem('isRefreshed');
        if (isRefreshed) {
        navigate('/home');
        } else {
        localStorage.setItem('isRefreshed', 'true');
        }
        return () => localStorage.removeItem('isRefreshed');
    }, [navigate]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
        const myData = {
            "type": "LEAVE-TOURNAMENT",
            "id": idTournament,
        };
        if (tournamentSocket) {
            tournamentSocket.send(JSON.stringify(myData));
        }
        };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      const myData = {
        "type": "LEAVE-TOURNAMENT",
        "id": idTournament,
      };
      if (tournamentSocket) {
          tournamentSocket.send(JSON.stringify(myData));
      }
    };
  }, [idTournament, tournamentSocket, location]);

  return (
    <div id="background-container">
      TEST
    </div>
  );
};

export default WaitingTournaments;
