import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlayButton.css';

const PlayButton: React.FC = () => {
  const [isPressed, setIsPressed] = useState(false);
  const navigate = useNavigate();

  const handleMouseDown = () => {
    setIsPressed(true);
  };
  
  const handleMouseUp = () => {
    setIsPressed(false);
  };
  
  const handleClick = () => {
    const button = document.querySelector('.play-button');
    if (!button) return;
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    button.appendChild(ripple);
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    
    ripple.style.left = '0';
    ripple.style.top = '0';
    
    ripple.addEventListener('animationend', () => {
      ripple.remove();
      navigate('/game');
    });
    
    // Here you would normally navigate to the game or start it
    console.log('Play button clicked');
  };
  
  return (
    <button 
      className={`play-button ${isPressed ? 'pressed' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
    >
      PLAY
    </button>
  );
};

export default PlayButton;