'use client';

import { useEffect, useRef } from 'react';

import { usePointerVelocity } from '@/hooks/usePointerVelocity';
import { useUniverseStore } from '@/lib/store';

interface TrailParticle {
  x: number;
  y: number;
  life: number;
  size: number;
}

const MAX_PARTICLES = 90;

/**
 * A canvas-based cursor. Kept out of React state entirely — the whole thing
 * runs on one animation frame loop and never triggers a rerender.
 */
export function CursorOrb(): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = usePointerVelocity();
  const particles = useRef<TrailParticle[]>([]);
  const hovered = useUniverseStore((state) => state.hovered);
  const hoveredRef = useRef<string | null>(null);
  hoveredRef.current = hovered;

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    document.documentElement.classList.add('has-custom-cursor');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let raf = 0;
    let radius = 8;

    const resize = (): void => {
      const ratio = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (): void => {
      const { x, y, velocity } = pointer.current;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Faster movement spawns a longer trail.
      const spawnCount = Math.min(Math.round(velocity * 2.6), 4);
      for (let i = 0; i < spawnCount; i += 1) {
        if (particles.current.length >= MAX_PARTICLES) break;
        particles.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          life: 1,
          size: 1.2 + Math.random() * 2.2,
        });
      }

      particles.current = particles.current.filter((particle) => {
        particle.life -= 0.028;
        if (particle.life <= 0) return false;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        context.fillStyle = `rgba(122, 245, 255, ${particle.life * 0.5})`;
        context.fill();
        return true;
      });

      // The orb expands over interactive targets.
      const targetRadius = hoveredRef.current ? 22 : 8 + Math.min(velocity * 1.6, 8);
      radius += (targetRadius - radius) * 0.14;

      const gradient = context.createRadialGradient(x, y, 0, x, y, radius * 2.6);
      gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
      gradient.addColorStop(0.28, 'rgba(122,245,255,0.55)');
      gradient.addColorStop(1, 'rgba(109,93,246,0)');

      context.beginPath();
      context.arc(x, y, radius * 2.6, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.fill();

      context.beginPath();
      context.arc(x, y, radius * 0.34, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255,255,255,0.9)';
      context.fill();

      if (hoveredRef.current) {
        context.beginPath();
        context.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(122,245,255,0.6)';
        context.lineWidth = 1;
        context.stroke();
      }

      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.documentElement.classList.remove('has-custom-cursor');
      particles.current = [];
    };
  }, [pointer]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] hidden md:block"
    />
  );
}
