import React from 'react';
// import useWebSocket, { ReadyState } from 'react-use-websocket';

const WebSocketComponent = () => {
  const socketUrl = 'ws://localhost:8000/ws/status/';
  const { readyState } = useWebSocket(socketUrl);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <div>Connection Status: {connectionStatus}</div>
    </div>
  );
};

export default WebSocketComponent;