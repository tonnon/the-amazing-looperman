import React, { useEffect, useRef } from 'react';
import './ParticleEffect.css';

const ParticleEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Number of particles based on screen size
    const numParticles = Math.min(50, Math.floor(window.innerWidth / 20));
    
    for (let i = 0; i < numParticles; i++) {
      createParticle(container);
    }
    
    return () => {
      // Clean up particles on unmount
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, []);
  
  const createParticle = (container: HTMLElement) => {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random positioning
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    
    // Random size
    const size = Math.random() * 3 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random opacity and animation duration
    const opacity = Math.random() * 0.5 + 0.2;
    particle.style.opacity = opacity.toString();
    
    const duration = Math.random() * 10 + 10; // 10-20s
    particle.style.animationDuration = `${duration}s`;
    
    // Random delays
    const delay = Math.random() * 5;
    particle.style.animationDelay = `${delay}s`;
    
    container.appendChild(particle);
  };
  
  return <div ref={containerRef} className="particle-container" />;
};

export default ParticleEffect;