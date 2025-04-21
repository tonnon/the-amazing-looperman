import React, { useEffect, useRef } from 'react';
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

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const blueParticlesRef = useRef<PortalParticle[]>([]);
  const orangeParticlesRef = useRef<PortalParticle[]>([]);
  const glowPulseRef = useRef<number>(0);
  const animationRef = useRef<number>();

  // Configurações ajustadas
  const PORTAL_RADIUS = 70;
  const PORTAL_HEIGHT_RATIO = 0.6; // Fator de achatamento vertical
  const INNER_PARTICLES = 100;
  const GLOW_PARTICLES = 120;

  // Posições mais extremas (10% e 90% da largura)
  const BLUE_PORTAL_X = () => canvasRef.current ? canvasRef.current.width * 0.05 : 0;
  const ORANGE_PORTAL_X = () => canvasRef.current ? canvasRef.current.width * 0.95 : 0;
  const PORTAL_Y = () => canvasRef.current ? canvasRef.current.height * 0.5 : 0;

  // Inicialização
  const initStars = (canvas: HTMLCanvasElement) => {
    starsRef.current = Array.from({ length: 200 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.7 + 0.3
    }));
  };

  const initPortalParticles = () => {
    blueParticlesRef.current = createParticles(true);
    orangeParticlesRef.current = createParticles(false);
  };

  const createParticles = (isBlue: boolean) => {
    const centerX = isBlue ? BLUE_PORTAL_X() : ORANGE_PORTAL_X();
    const particles: PortalParticle[] = [];
    
    // Partículas internas
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
    
    // Partículas de brilho
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

  // Atualização de partículas
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
        x: centerX + Math.cos(p.angle) * radius * 0.3, // Mais achatado horizontalmente
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

  // Renderização
  const drawScene = (ctx: CanvasRenderingContext2D) => {
    // Fundo espacial
    ctx.fillStyle = '#050520';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Estrelas
    starsRef.current.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.fill();
    });

    // Portal Azul (esquerda)
    drawVerticalPortal(
      ctx,
      BLUE_PORTAL_X(),
      PORTAL_Y(),
      ['#00aeff', '#0066ff', '#00f2ff'],
      blueParticlesRef.current
    );

    // Portal Laranja (direita)
    drawVerticalPortal(
      ctx,
      ORANGE_PORTAL_X(),
      PORTAL_Y(),
      ['#ff9d00', '#ff5500', '#ffec00'],
      orangeParticlesRef.current
    );
  };

  const drawVerticalPortal = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    colors: string[],
    particles: PortalParticle[]
  ) => {
    // Glow externo (agora do mesmo tamanho do portal)
    const glow = ctx.createRadialGradient(x, y, 0, x, y, PORTAL_RADIUS * 5);
    glow.addColorStop(0, `${colors[0]}60`);
    glow.addColorStop(0.5, `${colors[1]}90`);
    glow.addColorStop(1, 'transparent');
    
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      x, y,
      PORTAL_RADIUS * 0.5, // Mesmo achatamento horizontal do portal
      PORTAL_RADIUS * 1.5, // Mesmo alongamento vertical do portal
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = glow;
    ctx.fill();
    ctx.restore();
  
    // Partículas de glow (mantido)
    particles.filter(p => p.size > 4).forEach(p => {
      const alpha = 0.4 * (1 - p.z);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${colors[1]}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
  
    // Portal principal (ajustado para ter brilho interno do mesmo tamanho)
    const portalGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, PORTAL_RADIUS // Gradiente cobrindo toda a área do portal
    );
    portalGradient.addColorStop(0, `${colors[0]}ff`);
    portalGradient.addColorStop(0.7, `${colors[1]}aa`);
    portalGradient.addColorStop(1, `${colors[1]}00`);
    
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      x, y,
      PORTAL_RADIUS * 0.5, // Achatamento horizontal
      PORTAL_RADIUS * 1.5, // Alongamento vertical
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = portalGradient;
    ctx.fill();
    
    // Borda do portal (mais sutil)
    ctx.strokeStyle = `${colors[2]}cc`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  
    // Partículas internas (mantido)
    particles.filter(p => p.size <= 4).forEach(p => {
      const alpha = 0.8 * (1 - p.z);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - p.z * 0.7), 0, Math.PI * 2);
      ctx.fillStyle = `${colors[2]}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
  
    // Removido o núcleo brilhante separado (agora integrado no gradiente)
  };

  // Loop de animação
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    updateParticles();
    drawScene(ctx);
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas);
      initPortalParticles();
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current!);
    };
  }, []);

  return <canvas ref={canvasRef} className="game-canvas" />;
};

export default GameCanvas;