import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
    const [socketUser, setSocket] = useState(null);

    const listeners = useRef([]);
	const listenersStatus = useRef([]);
	const listenersNotifs = useRef([]);

    const myJwt = localStorage.getItem("jwt");
    
    useEffect(() => {
        if (!myJwt) {
            return;
        }
  
        const socket = new WebSocket(`ws://localhost:8000/ws/socketUser/?token=${myJwt}`);
  
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
			if (data.status)
				listenersStatus.current.forEach(callback => callback(data));
			if (data.friendsInvitations || data.gamesInvitations || data.acceptGameInvitation)
				listenersNotifs.current.forEach(callback => callback(data));
			else
            	listeners.current.forEach(callback => callback(data));
        };
        setSocket(socket);
  
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
  
	const subscribeToStatus = (callback) => {
		listenersStatus.current.push(callback);
		return () => {
            listenersStatus.current = listenersStatus.current.filter(listener => listener !== callback);
        };
	}

	const subscribeToNotifs = (callback) => {
		listenersNotifs.current.push(callback);
		return () => {
            listenersNotifs.current = listenersNotifs.current.filter(listener => listener !== callback);
        };
	}

    return (
        <WebSocketContext.Provider value={{ socketUser, subscribeToMessages, subscribeToStatus, subscribeToNotifs }}>
            {children}
        </WebSocketContext.Provider>
    );
};
