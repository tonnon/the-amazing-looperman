import React from 'react';
import './PortalRings.css';

const PortalRings: React.FC = () => {
  return (
    <div className="portal-rings-container">
      <div className="portal-ring portal-ring-orange"></div>
      <div className="portal-ring portal-ring-blue"></div>
      <div className="portal-ring portal-ring-orange-small"></div>
      <div className="portal-ring portal-ring-blue-small"></div>
    </div>
  );
};

export default PortalRings;