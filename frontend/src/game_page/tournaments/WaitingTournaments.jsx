import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../../provider/WebSocketProvider'
import { useAuth } from '../../provider/UserAuthProvider'
import '../css/waitTournaments.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const WaitingTournaments = ({roomId, maxScore, powerUp}) => {
    const {myUser} = useAuth();
    const {socketUser} = useWebSocket();
    const location = useLocation();
    const myJwt = localStorage.getItem("jwt");


    useEffect(() => {
        const tournamentSocket = new WebSocket(`ws://c1r1p3:8000/ws/TournamentsConsumer/?token=${myJwt}`);

        tournamentSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data) {
                console.log("data socket tournament ---> ", data)
            }
        };

        return () => {
            if (tournamentSocket.readyState === WebSocket.OPEN) {
                tournamentSocket.close();
            }
        };
    }, []);


    return (
        <div id="background-container">
            TEST
        </div>

    );
};

export default WaitingTournaments;
