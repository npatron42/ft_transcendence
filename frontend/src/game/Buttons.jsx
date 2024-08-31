import React from 'react';

export const StartButton = ({ onStart }) => {
    return (
        <div className="StartButton" onClick={onStart}>Start</div>
    );
};

export const StopButton = ({ onStop }) => {
    return (
        <div className="StopButton" onClick={onStop}>Stop</div>
    );
};
