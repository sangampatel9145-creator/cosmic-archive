'use client';

import { useEffect, useState } from 'react';

import { frameState } from '@/lib/frameState';

/**
 * Mirrors the scene clock into React at a deliberately low frequency. The
 * chart only needs a few updates per second, so this avoids re-rendering DOM
 * overlays sixty times a second.
 */
export function useOrbitClock(intervalMs = 220): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(frameState.sceneElapsed);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return elapsed;
}
