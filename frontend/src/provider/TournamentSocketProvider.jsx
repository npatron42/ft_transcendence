import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const TournamentContext = createContext(null);

export const useTournamentSocket = () => {
    return useContext(TournamentContext);
};

export const TournamentSocketProvider = ({ children }) => {
    const [tournamentSocket, setSocket] = useState(null);

    const listeners = useRef([]);

    const myJwt = localStorage.getItem("jwt");

    useEffect(() => {
        if (!myJwt) {
            return;
        }

        const socket = new WebSocket(`ws://localhost:8000/ws/tournamentsConsumer/?token=${myJwt}`);
        setSocket(socket);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            listeners.current.forEach(callback => callback(data));
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [myJwt]);

    const subscribeToMessages = (callback) => {
        listeners.current.push(callback);
        return () => {
            listeners.current = listeners.current.filter(listener => listener !== callback);
        };
    };

    return (
        <TournamentContext.Provider value={{ tournamentSocket, subscribeToMessages}}>
            {children}
        </TournamentContext.Provider>
    );
};
