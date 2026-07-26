'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';

export interface PointerSample {
  x: number;
  y: number;
  velocity: number;
  stillMs: number;
}

/**
 * Tracks pointer position and smoothed speed in a ref so consumers can read it
 * inside animation frames without triggering React renders.
 */
export function usePointerVelocity(): MutableRefObject<PointerSample> {
  const sample = useRef<PointerSample>({ x: 0, y: 0, velocity: 0, stillMs: 0 });

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      sample.current.x = event.clientX;
      sample.current.y = event.clientY;
      sample.current.velocity = sample.current.velocity * 0.72 + speed * 0.28;
      sample.current.stillMs = 0;

      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = now;
    };

    let previousFrame = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = now - previousFrame;
      previousFrame = now;
      sample.current.velocity *= 0.9;
      sample.current.stillMs += dt;
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return sample;
}
