import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
export const WebSocketProvider = ({ children }) => {
	const [socketUser, setSocket] = useState(null);
	const myJwt = localStorage.getItem("jwt");

	useEffect(() => {

	if (!myJwt)
		return ;

	const socketUser = new WebSocket(`ws://localhost:8000/ws/socketUser/?token=${myJwt}`);

	setSocket(socketUser);

	return () => {
		if (socketUser.readyState === WebSocket.OPEN) {
			socketUser.close();
		}
	};
	}, [myJwt]);
  
	return (
	  <WebSocketContext.Provider value={socketUser}>
		{children}
	  </WebSocketContext.Provider>
	);
  };