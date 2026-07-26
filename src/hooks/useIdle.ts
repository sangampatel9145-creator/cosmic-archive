'use client';

import { useEffect, useRef, useState } from 'react';

/** Reports whether the user has been inactive for longer than `timeoutMs`. */
export function useIdle(timeoutMs: number): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      setIsIdle(false);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setIsIdle(true), timeoutMs);
    };

    const events: readonly (keyof WindowEventMap)[] = [
      'pointermove',
      'pointerdown',
      'keydown',
      'wheel',
      'touchstart',
    ];

    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((event) => window.removeEventListener(event, reset));
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [timeoutMs]);

  return isIdle;
}
