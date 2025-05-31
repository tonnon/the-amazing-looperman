import React from 'react';
import './GameOverModal.css';

interface GameOverModalProps {
  show: boolean;
  loops: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ show, loops, onRestart }) => {
  if (!show) return null;

  return (
    <div className="game-over-modal">
      <div className="modal-content">
        <h2>Game Over</h2>
        <p>Total Loops: {loops}</p>
        <button onClick={onRestart}>Restart</button>
      </div>
    </div>
  );
};

export default GameOverModal; 