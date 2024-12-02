import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const WebSocketContext = createContext(null);
import { useNavigate } from 'react-router-dom'

const host = import.meta.env.VITE_HOST;


export const useWebSocket = () => {
    return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
    const [socketUser, setSocket] = useState(null);

    const listeners = useRef([]);
    const listenersStatus = useRef([]);
    const listenersNotifs = useRef([]);
    const navigate = useNavigate() 
    const myJwt = localStorage.getItem("jwt");

    useEffect(() => {
        if (!myJwt) {
            return;
        }

        const socket = new WebSocket(`wss://${location.host}/ws/socketUser/?token=${myJwt}`);
        setSocket(socket);

        const pingInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                // socket.send(JSON.stringify({ type: "ping" }));
            }
        }, 10000);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data["DOUBLE-JWT"]) {
                localStorage.removeItem("jwt")
                navigate("/")
                alert("Double JWT")
                return
            }
            else if (data.status) {
                listenersStatus.current.forEach(callback => callback(data));
            } else if (data.friendsInvitations || data.gamesInvitations || data.acceptGameInvitation) {
                listenersNotifs.current.forEach(callback => callback(data));
            } else {
                listeners.current.forEach(callback => callback(data));
            }
        };

        socket.onclose = () => {
            clearInterval(pingInterval); 
        };

        return () => {
            clearInterval(pingInterval);
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

    const subscribeToStatus = (callback) => {
        listenersStatus.current.push(callback);
        return () => {
            listenersStatus.current = listenersStatus.current.filter(listener => listener !== callback);
        };
    };

    const subscribeToNotifs = (callback) => {
        listenersNotifs.current.push(callback);
        return () => {
            listenersNotifs.current = listenersNotifs.current.filter(listener => listener !== callback);
        };
    };

    return (
        <WebSocketContext.Provider value={{ socketUser, subscribeToMessages, subscribeToStatus, subscribeToNotifs }}>
            {children}
        </WebSocketContext.Provider>
    );
};
