import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

import { useNavigate } from 'react-router-dom'

const TournamentContext = createContext(null);

export const useTournamentSocket = () => {
    return useContext(TournamentContext);
};

const host = import.meta.env.VITE_HOST;

export const TournamentSocketProvider = ({ children }) => {
    const [tournamentSocket, setSocket] = useState(null);

    const listeners = useRef([]);

    const myJwt = localStorage.getItem("jwt");

    const navigate = useNavigate();

    useEffect(() => {
        if (!myJwt) {
            return;
        }

        const socket = new WebSocket(`wss://${location.host}/ws/tournamentsConsumer/?token=${myJwt}`);
        setSocket(socket);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            listeners.current.forEach(callback => callback(data));
            if (data.message["DEGAGE-FILS-DE-PUTE"]) {
                localStorage.removeItem("jwt")
                navigate("/")
                alert("Double JWT")
                return
            }
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [myJwt]);

    const subscribeToTournaments = (callback) => {
        listeners.current.push(callback);
        return () => {
            listeners.current = listeners.current.filter(listener => listener !== callback);
        };
    };

    return (
        <TournamentContext.Provider value={{ tournamentSocket, subscribeToTournaments}}>
            {children}
        </TournamentContext.Provider>
    );
};
