'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function GalaxyBackground() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Resize canvas to fill window
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // Helper for random color of stars (white, slight blue, slight yellow/orange)
    const getStarColor = () => {
      const rand = Math.random();
      if (rand > 0.8) return 'rgba(200, 220, 255,'; // slight blue
      if (rand > 0.6) return 'rgba(255, 240, 200,'; // slight yellow
      return 'rgba(255, 255, 255,'; // pure white
    };

    // Stars with depth (z) for parallax moving effect
    // We add 'isBright' to identify stars that should have the cross/flare effect
    const stars: { 
      x: number; 
      y: number; 
      z: number; 
      radius: number; 
      alpha: number; 
      speedAlpha: number;
      baseColor: string;
      isBright: boolean;
    }[] = [];
    
    // Increased star count to 3500
    for (let i = 0; i < 3500; i++) {
      const isBright = Math.random() > 0.95; // 5% of stars are bright with lens flares
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * width, // depth for parallax
        radius: isBright ? Math.random() * 2 + 1.5 : Math.random() * 1.5 + 0.2, // larger radius for bright stars
        alpha: Math.random() * 0.5 + 0.5, // start brighter
        speedAlpha: (Math.random() - 0.5) * 0.005, // slow twinkling
        baseColor: getStarColor(),
        isBright,
      });
    }

    // Comets / Shooting Stars instead of clunky stones
    const comets: {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      length: number;
      opacity: number;
      life: number;
    }[] = [];

    const createComet = () => {
      const isHorizontal = Math.random() > 0.5;
      const startX = isHorizontal ? Math.random() * width : Math.random() * width * 1.5;
      const startY = isHorizontal ? Math.random() * height * 0.3 : -100;
      
      comets.push({
        x: startX,
        y: startY,
        speedX: -2 - Math.random() * 3, // moving left
        speedY: 2 + Math.random() * 3, // moving down
        length: 80 + Math.random() * 100,
        opacity: 0, // fade in
        life: 1, // life decrements slowly
      });
    };

    // Milky Way Nebula Orbs (Slowly drifting blurred circles)
    const nebulas = [
      { x: width * 0.2, y: height * 0.3, r: width * 0.4, color: 'rgba(30, 20, 60, 0.4)', dx: 0.1, dy: -0.05 },
      { x: width * 0.8, y: height * 0.7, r: width * 0.4, color: 'rgba(20, 30, 70, 0.3)', dx: -0.1, dy: 0.05 },
      { x: width * 0.5, y: height * 0.5, r: width * 0.5, color: 'rgba(40, 10, 50, 0.2)', dx: 0.05, dy: 0.08 },
    ];

    // Function to draw a glowing 4-pointed star (lens flare effect)
    const drawStarStructure = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colorPrefix: string, alpha: number) => {
      // Glow/halo
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      gradient.addColorStop(0, `${colorPrefix} ${alpha * 0.8})`);
      gradient.addColorStop(1, `${colorPrefix} 0)`);
      ctx.beginPath();
      ctx.arc(x, y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core bright center
      ctx.beginPath();
      ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();

      // 4-pointed cross (lens flare)
      ctx.beginPath();
      ctx.moveTo(x, y - r * 4); // top
      ctx.lineTo(x + r * 0.3, y); // center right
      ctx.lineTo(x + r * 4, y); // right
      ctx.lineTo(x + r * 0.3, y); // center right
      ctx.lineTo(x, y + r * 4); // bottom
      ctx.lineTo(x - r * 0.3, y); // center left
      ctx.lineTo(x - r * 4, y); // left
      ctx.lineTo(x - r * 0.3, y); // center left
      ctx.closePath();
      
      const crossGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      crossGrad.addColorStop(0, `${colorPrefix} ${alpha * 0.9})`);
      crossGrad.addColorStop(1, `${colorPrefix} 0)`);
      ctx.fillStyle = crossGrad;
      ctx.fill();
    };

    const render = () => {
      // Very dark background
      ctx.fillStyle = '#010205';
      ctx.fillRect(0, 0, width, height);

      // Draw Nebulas (Milky way clouds)
      nebulas.forEach(neb => {
        neb.x += neb.dx;
        neb.y += neb.dy;
        
        // bounce off rough edges
        if (neb.x < -width || neb.x > width * 2) neb.dx *= -1;
        if (neb.y < -height || neb.y > height * 2) neb.dy *= -1;

        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // Draw Stars with Parallax
      const cx = width / 2;
      const cy = height / 2;

      stars.forEach(star => {
        // Twinkle
        star.alpha += star.speedAlpha;
        if (star.alpha <= 0.3 || star.alpha >= 1) star.speedAlpha *= -1; // keep baseline brightness high
        
        // Move towards viewer (z decreases)
        star.z -= 1.25; // Faster majestic motion 
        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width;
          star.y = Math.random() * height;
        }

        // Calculate 2D position based on depth
        // This gives the feeling of flying through the galaxy slowly
        const x = (star.x - cx) * (width / star.z) + cx;
        const y = (star.y - cy) * (width / star.z) + cy;
        const r = Math.max(0.1, star.radius * (width / star.z) * 0.5);

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
          if (star.isBright && r > 0.8) {
            // Draw real star structure (lens flare) for bright stars that are close enough
            drawStarStructure(ctx, x, y, r, star.baseColor, star.alpha);
          } else {
            // Standard small round star
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `${star.baseColor} ${Math.max(0, star.alpha)})`;
            ctx.fill();
          }
        }
      });

      // Spawn comets occasionally
      if (Math.random() < 0.005 && comets.length < 3) {
        createComet();
      }

      // Draw Comets
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.speedX;
        c.y += c.speedY;
        
        // Fade in and out
        if (c.life > 0.5 && c.opacity < 1) c.opacity += 0.05;
        if (c.life < 0.5) c.opacity -= 0.02;
        c.life -= 0.005;

        if (c.opacity <= 0) {
          comets.splice(i, 1);
          continue;
        }

        // Draw comet tail (gradient)
        const tailX = c.x - (c.speedX / Math.abs(c.speedX)) * c.length;
        const tailY = c.y - (c.speedY / Math.abs(c.speedY)) * c.length;

        const grad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${c.opacity})`);
        grad.addColorStop(0.1, `rgba(150, 200, 255, ${c.opacity * 0.8})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw comet head
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
