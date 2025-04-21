import React, { useEffect, useRef } from 'react';
import './GameCanvas.css';

interface Star {
  x: number;
  y: number;
  size: number;
  baseBrightness: number; // Base brightness level (0.1-0.7)
  pulseSpeed: number;     // How fast the star pulses (0.001-0.01)
  pulsePhase: number;     // Current phase of the pulse (0-2π)
}

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  // Initialize stars with slow glow parameters
  const initStars = (canvas: HTMLCanvasElement, count: number = 150) => {
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.7, // 0.7-2.5px
        baseBrightness: Math.random() * 0.6 + 0.1, // 10-70% base brightness
        pulseSpeed: Math.random() * 0.005 + 0.001, // Very slow pulse
        pulsePhase: Math.random() * Math.PI * 2 // Random starting phase
      });
    }
    starsRef.current = stars;
  };

  // Draw stars with slow pulsing glow
  const drawStars = (ctx: CanvasRenderingContext2D, deltaTime: number) => {
    // Deep space background (rich black with subtle blue tone)
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    starsRef.current.forEach(star => {
      // Update pulse phase (very slowly)
      star.pulsePhase += star.pulseSpeed * (deltaTime / 16);
      
      // Calculate current brightness using sine wave for smooth pulse
      const pulseFactor = Math.sin(star.pulsePhase) * 0.3 + 0.7; // 40-100% modulation
      const currentBrightness = star.baseBrightness * pulseFactor;

      // Create glowing effect with gradient
      const glowSize = star.size * 4;
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, glowSize
      );
      
      // Core of the star (brightest point)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${currentBrightness})`);
      
      // Outer glow (fades to transparent)
      gradient.addColorStop(0.7, `rgba(200, 220, 255, ${currentBrightness * 0.3})`);
      gradient.addColorStop(1, 'rgba(100, 120, 255, 0)');

      // Draw the star
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  };

  // Animation loop with deltaTime calculation
  const animate = (timestamp: number, lastTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate time since last frame for consistent animation speed
    const deltaTime = timestamp - lastTime;
    
    drawStars(ctx, deltaTime);
    animationRef.current = requestAnimationFrame((t) => animate(t, timestamp));
  };

  // Setup and cleanup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    animationRef.current = requestAnimationFrame((t) => animate(t, performance.now()));

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="game-canvas"
    />
  );
};

export default GameCanvas;