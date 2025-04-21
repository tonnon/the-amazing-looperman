import React from 'react';
import './GameTitle.css';

const GameTitle: React.FC = () => {
  return (
    <div className="game-title-container">
      <h1 className="game-title">
        <span className="the">THE</span>
        <span className="amazing">AMAZING</span>
        <span className="looperman">LOOPERMAN</span>
      </h1>
    </div>
  );
};

export default GameTitle;