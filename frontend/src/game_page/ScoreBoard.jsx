import React from 'react';
import './css/game.css';

export const ScoreBoard = ({ score1, score2, player1Id, player2Id }) => {
  return (
    <div className="scoreboard">
      <div className="score score_1">{player1Id} : {score1}</div>
      <div className="score score_2">{player2Id} : {score2}</div>
    </div>
  );
};
