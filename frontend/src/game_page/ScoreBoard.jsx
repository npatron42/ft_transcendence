import React from 'react';
import './css/game.css';

export const ScoreBoard = ({ score1, score2, player1, player2 }) => {
  return (
    <div className="scoreboard">
      <div className="score score_1">{player1} : {score1}</div>
      <div className="score score_2">{player2} : {score2}</div>
    </div>
  );
};
