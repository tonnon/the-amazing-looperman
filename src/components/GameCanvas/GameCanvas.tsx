import React, { useEffect, useRef, useState } from 'react';
import './GameCanvas.css';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
}

interface PortalParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  angle: number;
  life: number;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  image: HTMLImageElement | null;
}

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const blueParticlesRef = useRef<PortalParticle[]>([]);
  const orangeParticlesRef = useRef<PortalParticle[]>([]);
  const glowPulseRef = useRef<number>(0);
  const animationRef = useRef<number>();
  const [player, setPlayer] = useState<Player>({
    x: 65,
    y: 420,
    width: 60,
    height: 80,
    speed: 5,
    image: null
  });
  const playerRef = useRef<Player>({
    x: 65,
    y: 420,
    width: 60,
    height: 80,
    speed: 5,
    image: null
  });
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const keysPressed = useRef({
    left: false,
    right: false,
    a: false,
    d: false
  });
  const [loops, setLoops] = useState(0);

  // Portal Configurations
  const PORTAL_RADIUS = 70;
  const PORTAL_HEIGHT_RATIO = 0.6;
  const INNER_PARTICLES = 100;
  const GLOW_PARTICLES = 120;

  // Portal positions
  const BLUE_PORTAL_X = () => canvasRef.current ? canvasRef.current.width * 0.05 : 0;
  const ORANGE_PORTAL_X = () => canvasRef.current ? canvasRef.current.width * 0.95 : 0;
  const PORTAL_Y = () => canvasRef.current ? canvasRef.current.height * 0.5 : 0;

  // Initialize stars
  const initStars = (canvas: HTMLCanvasElement) => {
    starsRef.current = Array.from({ length: 200 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.7 + 0.3
    }));
  };

  // Initialize portal particles
  const initPortalParticles = () => {
    blueParticlesRef.current = createParticles(true);
    orangeParticlesRef.current = createParticles(false);
  };

  // Create particles
  const createParticles = (isBlue: boolean) => {
    const centerX = isBlue ? BLUE_PORTAL_X() : ORANGE_PORTAL_X();
    const particles: PortalParticle[] = [];
    
    for (let i = 0; i < INNER_PARTICLES; i++) {
      particles.push({
        x: centerX,
        y: PORTAL_Y(),
        z: Math.random(),
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.001 + 0.005,
        angle: Math.random() * Math.PI * 4,
        life: Math.random() * 100
      });
    }
    
    for (let i = 0; i < GLOW_PARTICLES; i++) {
      particles.push({
        x: centerX,
        y: PORTAL_Y(),
        z: Math.random() * 0.5,
        size: Math.random() * 5 + 2,
        speed: Math.random() * 0.01 + 0.002,
        angle: Math.random() * Math.PI * 2,
        life: Math.random() * 100
      });
    }
    
    return particles;
  };

  // Update particles
  const updateParticles = () => {
    glowPulseRef.current = (glowPulseRef.current + 0.21) % (Math.PI * 4);
    blueParticlesRef.current = blueParticlesRef.current.map(updateParticle(true));
    orangeParticlesRef.current = orangeParticlesRef.current.map(updateParticle(false));
  };

  const updateParticle = (isBlue: boolean) => (p: PortalParticle) => {
    const centerX = isBlue ? BLUE_PORTAL_X() : ORANGE_PORTAL_X();
    
    if (p.size <= 4) {
      const newZ = (p.z + p.speed) % 1;
      const radius = PORTAL_RADIUS * 0.8 * (1 - newZ * 0.7);
      
      return {
        ...p,
        x: centerX + Math.cos(p.angle) * radius * 0.3,
        y: PORTAL_Y() + Math.sin(p.angle) * radius * PORTAL_HEIGHT_RATIO,
        z: newZ,
        angle: p.angle + p.speed * 3,
        life: p.life + 0.5
      };
    } else {
      const pulse = Math.sin(glowPulseRef.current + p.life * 0.1) * 0.3 + 0.7;
      const radius = PORTAL_RADIUS * (1.3 + pulse * 0.3);
      
      return {
        ...p,
        x: centerX + Math.cos(p.angle) * radius * 0.4,
        y: PORTAL_Y() + Math.sin(p.angle) * radius * PORTAL_HEIGHT_RATIO,
        z: p.z,
        angle: p.angle + p.speed,
        life: p.life + 0.2,
        size: p.size * pulse
      };
    }
  };

  // Check collision between player and portal
  const checkPortalCollision = (portalX: number) => {
    const playerCenterX = playerRef.current.x + playerRef.current.width / 2;
    const playerCenterY = playerRef.current.y + playerRef.current.height / 2;
    const portalCenterY = PORTAL_Y();
    
    const dx = playerCenterX - portalX;
    const dy = playerCenterY - portalCenterY;
    
    const portalWidth = PORTAL_RADIUS * 0.5;
    const portalHeight = PORTAL_RADIUS * 1.5;
    
    const normalizedDistance = (dx * dx) / (portalWidth * portalWidth) + 
                             (dy * dy) / (portalHeight * portalHeight);
    
    return normalizedDistance <= 0.7;
  };

  // Update player position
  const updatePlayer = () => {
    const { right, d } = keysPressed.current;
    let moveX = 0;
    if (right || d) moveX += playerRef.current.speed;
  
    if (canvasRef.current) {
      let newX = playerRef.current.x + moveX;
      newX = Math.max(0, Math.min(newX, canvasRef.current.width - playerRef.current.width));
  
      if (checkPortalCollision(ORANGE_PORTAL_X())) {
        playerRef.current.x = BLUE_PORTAL_X() - playerRef.current.width / 2;
        setLoops(l => l + 1);
      } else if (moveX !== 0) {
        playerRef.current.x = newX;
      }
    }
  };
  
  // Draw vertical portal
  const drawVerticalPortal = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    colors: string[],
    particles: PortalParticle[]
  ) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, PORTAL_RADIUS * 5);
    glow.addColorStop(0, `${colors[0]}60`);
    glow.addColorStop(0.5, `${colors[1]}90`);
    glow.addColorStop(1, 'transparent');
    
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      x, y,
      PORTAL_RADIUS * 0.5,
      PORTAL_RADIUS * 1.5,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = glow;
    ctx.fill();
    ctx.restore();
  
    particles.filter(p => p.size > 4).forEach(p => {
      const alpha = 0.4 * (1 - p.z);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${colors[1]}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
  
    const portalGradient = ctx.createRadialGradient(x, y, 0, x, y, PORTAL_RADIUS);
    portalGradient.addColorStop(0, `${colors[0]}ff`);
    portalGradient.addColorStop(0.7, `${colors[1]}aa`);
    portalGradient.addColorStop(1, `${colors[1]}00`);
    
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, PORTAL_RADIUS * 0.5, PORTAL_RADIUS * 1.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = portalGradient;
    ctx.fill();
    ctx.strokeStyle = `${colors[2]}cc`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  
    particles.filter(p => p.size <= 4).forEach(p => {
      const alpha = 0.8 * (1 - p.z);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - p.z * 0.7), 0, Math.PI * 2);
      ctx.fillStyle = `${colors[2]}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
  };

  useEffect(() => {
    const img = new Image();
    img.src = 'looperman.png';
    img.onload = () => {
      playerImageRef.current = img;
    };
  }, []);

  // drawPlayer function
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    if (playerImageRef.current) {
      ctx.drawImage(
        playerImageRef.current, 
        playerRef.current.x, 
        playerRef.current.y, 
        playerRef.current.width, 
        playerRef.current.height
      );
    }
  };

  // Draw score
  const drawScore = (ctx: CanvasRenderingContext2D) => {
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`Loops: ${loops}`, 20, 40);
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    updatePlayer();
    updateParticles();
    
    // Clear canvas
    ctx.fillStyle = '#050520';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    starsRef.current.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.fill();
    });

    // Draw portals
    drawVerticalPortal(ctx, BLUE_PORTAL_X(), PORTAL_Y(), ['#00aeff', '#0066ff', '#00f2ff'], blueParticlesRef.current);
    drawVerticalPortal(ctx, ORANGE_PORTAL_X(), PORTAL_Y(), ['#ff9d00', '#ff5500', '#ffec00'], orangeParticlesRef.current);
    drawPlayer(ctx);
    drawScore(ctx);
    animationRef.current = requestAnimationFrame(animate);
  };

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (starsRef.current.length === 0) { // Only initialize stars once
        initStars(canvas);
        initPortalParticles();
      }
    };

    handleResize();
    animate();

    // Sync playerRef with player state
    const syncRef = setInterval(() => {
      playerRef.current = player;
    }, 16);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(syncRef);
    };
  }, [loops]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowRight': 
          keysPressed.current.right = true; 
          break;
        case 'd': 
        case 'D': 
          keysPressed.current.d = true; 
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowRight': 
          keysPressed.current.right = false; 
          break;
        case 'd': 
        case 'D': 
          keysPressed.current.d = false; 
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <canvas ref={canvasRef} className="game-canvas" />;
};

export default GameCanvas;