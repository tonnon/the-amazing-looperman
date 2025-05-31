import React, { useEffect, useRef, useState } from 'react';
import './GameCanvas.css';
import GameOverModal from '../GameOverModal/GameOverModal';

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

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: number; // 1 for down, -1 for up
}

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const blueParticlesRef = useRef<PortalParticle[]>([]);
  const orangeParticlesRef = useRef<PortalParticle[]>([]);
  const glowPulseRef = useRef<number>(0);
  const animationRef = useRef<number>();
  const [player, setPlayer] = useState<Player>({
    x: 65, // Will be set dynamically in useEffect
    y: window.innerHeight * 0.46, // Dynamic Y position based on screen height
    width: 60,
    height: 80,
    speed: 5,
    image: null
  });
  const playerRef = useRef<Player>({
    x: 65, // Will be set dynamically in useEffect
    y: window.innerHeight * 0.5, // Dynamic Y position based on screen height
    width: 60,
    height: 80,
    speed: 5,
    image: null
  });
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const keysPressed = useRef({
    right: false,
    d: false
  });
  const [loops, setLoops] = useState(0);
  const enemyImageRef = useRef<HTMLImageElement | null>(null);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const isGameOverRef = useRef(false);

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

  // Initialize enemies
  const initEnemies = (canvas: HTMLCanvasElement) => {
    const newEnemies = Array.from({ length: 4 }).map((_, i) => {
      const x = canvas.width * (0.3 + i * 0.15);
      const y = Math.random() * canvas.height;
      const speed = 1 + Math.random() * 2; // Random speed between 1-3
      const direction = Math.random() > 0.5 ? 1 : -1; // Random initial direction
      
      return {
        x,
        y,
        width: 50,
        height: 50,
        speed,
        direction
      };
    });
    
    setEnemies(newEnemies);
    enemiesRef.current = newEnemies;
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

  // Increase enemy speeds
  const increaseEnemySpeeds = () => {
    if (enemiesRef.current.length === 0) return;
    
    const updatedEnemies = enemiesRef.current.map(enemy => {
      // Increase speed by 10%
      const newSpeed = enemy.speed * 1.1;
      
      return {
        ...enemy,
        speed: newSpeed
      };
    });
    
    enemiesRef.current = updatedEnemies;
  };

  // Update player position
  const updatePlayer = () => {
    if (gameOver || isGameOverRef.current) return;
    
    const { right, d } = keysPressed.current;
    let moveX = 0;
    if (right || d) moveX += playerRef.current.speed;
  
    if (canvasRef.current) {
      let newX = playerRef.current.x + moveX;
      newX = Math.max(0, Math.min(newX, canvasRef.current.width - playerRef.current.width));
  
      if (checkPortalCollision(ORANGE_PORTAL_X())) {
        // Position player perfectly centered in the blue portal
        playerRef.current.x = BLUE_PORTAL_X() - playerRef.current.width/2;
        playerRef.current.y = PORTAL_Y() - playerRef.current.height/2;
        setLoops(l => l + 1);
        increaseEnemySpeeds();
      } else if (moveX !== 0) {
        playerRef.current.x = newX;
      }
    }
  };

  // Check collision between player and enemy
  const checkEnemyCollision = () => {
    if (gameOver || isGameOverRef.current) return;

    const playerHitbox = {
      x: playerRef.current.x + playerRef.current.width * 0.2,
      y: playerRef.current.y + playerRef.current.height * 0.2,
      width: playerRef.current.width * 0.6,
      height: playerRef.current.height * 0.6
    };
    
    for (let enemy of enemiesRef.current) {
      const enemyHitbox = {
        x: enemy.x + enemy.width * 0.2,
        y: enemy.y + enemy.height * 0.2,
        width: enemy.width * 0.6,
        height: enemy.height * 0.6
      };
      
      if (
        playerHitbox.x < enemyHitbox.x + enemyHitbox.width &&
        playerHitbox.x + playerHitbox.width > enemyHitbox.x &&
        playerHitbox.y < enemyHitbox.y + enemyHitbox.height &&
        playerHitbox.y + playerHitbox.height > enemyHitbox.y
      ) {
        setGameOver(true);
        isGameOverRef.current = true;
        // Clear key presses to stop movement
        keysPressed.current = {
          right: false,
          d: false
        };
        return;
      }
    }
  };

  // Update enemies
  const updateEnemies = () => {
    if (!canvasRef.current || gameOver) return;

    const canvas = canvasRef.current;
    const updatedEnemies = enemiesRef.current.map(enemy => {
      let newY = enemy.y + (enemy.speed * enemy.direction);
      
      // Reverse direction if hitting top or bottom
      if (newY <= 0 || newY + enemy.height >= canvas.height) {
        return {
          ...enemy,
          y: newY <= 0 ? 0 : canvas.height - enemy.height,
          direction: -enemy.direction
        };
      }
      
      return {
        ...enemy,
        y: newY
      };
    });

    enemiesRef.current = updatedEnemies;
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

  // Reset game
  const resetGame = () => {
    if (!canvasRef.current) return;
    
    // Start at blue portal position - use same positioning as initial setup
    const bluePortalX = BLUE_PORTAL_X();
    const portalY = PORTAL_Y();
    
    const newPlayer = {
      x: bluePortalX - playerRef.current.width/2, // Center horizontally in portal, identical to initial setup
      y: portalY - playerRef.current.height/2, // Center vertically in portal, identical to initial setup
      width: 60,
      height: 80,
      speed: 5,
      image: playerImageRef.current
    };
    
    // Update both player references to ensure consistency
    playerRef.current = newPlayer;
    setPlayer(newPlayer);
    
    setLoops(0);
    setGameOver(false);
    isGameOverRef.current = false;
    initEnemies(canvasRef.current);
  };

  useEffect(() => {
    const img = new Image();
    img.src = 'looperman.png';
    img.onload = () => {
      playerImageRef.current = img;
    };

    const enemyImg = new Image();
    enemyImg.src = 'enemy.png';
    enemyImg.onload = () => {
      enemyImageRef.current = enemyImg;
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

  // Draw enemy
  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    if (enemyImageRef.current) {
      ctx.drawImage(
        enemyImageRef.current,
        enemy.x,
        enemy.y,
        enemy.width,
        enemy.height
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
    updateEnemies();
    updateParticles();
    checkEnemyCollision();
    
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
    enemiesRef.current.forEach(enemy => drawEnemy(ctx, enemy));
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
      
      // Update portal-related positions and player position when screen resizes
      if (starsRef.current.length === 0) { // Only initialize stars once
        initStars(canvas);
        initPortalParticles();
        initEnemies(canvas);
        
        // Initialize player position perfectly centered in blue portal
        const bluePortalX = BLUE_PORTAL_X();
        const portalY = PORTAL_Y();
        const newPlayer = {
          ...playerRef.current,
          x: bluePortalX - playerRef.current.width/2, // Perfect horizontal center
          y: portalY - playerRef.current.height/2 // Perfect vertical center
        };
        playerRef.current = newPlayer;
        setPlayer(newPlayer);
      } else {
        // Update player position if game is not in progress
        if (!gameOver && loops === 0) {
          const newPortalY = PORTAL_Y();
          const bluePortalX = BLUE_PORTAL_X();
          const newPlayer = {
            ...playerRef.current,
            x: bluePortalX - playerRef.current.width/2, // Perfect horizontal center
            y: newPortalY - playerRef.current.height/2 // Perfect vertical center
          };
          playerRef.current = newPlayer;
          setPlayer(newPlayer);
        }
        
        // Reinitialize particles to match new dimensions
        initPortalParticles();
      }
    };

    handleResize();
    
    // Add event listener for resize
    window.addEventListener('resize', handleResize);
    
    animate();

    // Sync playerRef with player state
    const syncRef = setInterval(() => {
      if (!gameOver && !isGameOverRef.current) {
        playerRef.current = player;
      }
    }, 16);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(syncRef);
      window.removeEventListener('resize', handleResize);
    };
  }, [loops, gameOver]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isGameOverRef.current) return;
      
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
  }, [gameOver]);

  return (
    <>
      <canvas ref={canvasRef} className="game-canvas" />
      <GameOverModal 
        show={gameOver} 
        loops={loops}
        onRestart={resetGame}
      />
    </>
  );
};

export default GameCanvas;