import React from 'react';

import './HeroSection.css';
import GameTitle from '../GameTitle/GameTitle';
import PlayButton from '../PlayButton/PlayButton';
import PortalRings from '../PortalRings/PortalRings';
import StarBackground from '../StarBackground/StarBackground';
import ParticleEffect from '../ParticleEffect/ParticleEffect';

const HeroSection: React.FC = () => {
  return (
    <div className="hero-section">
      <StarBackground />
      <ParticleEffect />
      <div className="hero-content">
        <GameTitle />
        <PlayButton />
      </div>
      <PortalRings />
    </div>
  );
};

export default HeroSection;