import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../../provider/WebSocketProvider'
import { useTournamentSocket } from '../../provider/TournamentSocketProvider';
import { useAuth } from '../../provider/UserAuthProvider'
import '../css/waitTournaments.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const WaitingTournaments = ({roomId, maxScore, powerUp}) => {
    const {myUser} = useAuth();
    const {socketUser} = useWebSocket();
    const {tournamentSocket} = useTournamentSocket();
    const location = useLocation();
    const myJwt = localStorage.getItem("jwt");

    return (
        <div id="background-container">
            TEST
        </div>
    );
};

export default WaitingTournaments;
