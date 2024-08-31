import React from 'react';
import './style.css';

export const ScoreBoard = ({ score1, score2 }) => {
  return (
    <div className="scoreboard">
      <div className="score score_1">Player 1 : {score1}</div>
      <div className="score score_2">Player 2 : {score2}</div>
    </div>
  );
};
