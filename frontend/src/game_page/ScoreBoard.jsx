import React from 'react';
import './css/game.css';

export const ScoreBoard = ({ score1, score2, maxScoreToUse }) => {
  const renderScoreSquares = (score, maxScoreToUse) => {
    const squares = [];
    // carre de score
    for (let i = 0; i < maxScoreToUse; i++) {
      squares.push(
        <div
          key={i}
          className={`score-square ${i < score ? 'active' : ''}`}
        />
      );
    }
    return squares;
  };

  return (
    <div className="scoreboard">
      <div className="score_1">{renderScoreSquares(score1, maxScoreToUse)}</div>
      <div className="score_2">{renderScoreSquares(score2, maxScoreToUse)}</div>
    </div>
  );
};
