import React from 'react';

export const StartButton = ({ onStart }) => {
    return (
        <div className="button" onClick={onStart}>Start</div>
    );
};

export const StopButton = ({ onStop }) => {
    return (
        <div className="button" onClick={onStop}>Stop</div>
    );
};
