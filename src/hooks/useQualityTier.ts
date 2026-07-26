'use client';

import { useEffect, useMemo, useState } from 'react';

import { QUALITY_SCALE } from '@/constants/theme';
import { useUniverseStore } from '@/lib/store';
import type { QualityTier } from '@/types';

function detectTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium';

  const cores = navigator.hardwareConcurrency ?? 4;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isSmall = window.innerWidth < 900;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

  if (cores <= 4 || memory <= 4 || (isCoarse && isSmall)) return 'low';
  if (cores <= 8 || isCoarse) return 'medium';
  return 'high';
}

export interface QualityProfile {
  readonly tier: QualityTier;
  readonly particleScale: number;
  readonly dpr: readonly [number, number];
  readonly bloom: boolean;
  readonly motionBlur: boolean;
  readonly reduceMotion: boolean;
}

/**
 * Resolves the effective render profile from the user's preference, the device's
 * measured capability and the OS reduced-motion setting.
 */
export function useQualityTier(): QualityProfile {
  const settings = useUniverseStore((state) => state.settings);
  const [detected, setDetected] = useState<QualityTier>('medium');
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    setDetected(detectTier());

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSystemReduceMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return useMemo(() => {
    const tier: QualityTier = settings.quality === 'auto' ? detected : settings.quality;
    const scale = QUALITY_SCALE[tier];
    const reduceMotion = settings.reduceMotion || systemReduceMotion;

    return {
      tier,
      particleScale: reduceMotion ? scale.particles * 0.5 : scale.particles,
      dpr: scale.dpr,
      bloom: settings.bloom && scale.bloom && !reduceMotion,
      motionBlur: settings.motionBlur && tier !== 'low' && !reduceMotion,
      reduceMotion,
    };
  }, [detected, settings, systemReduceMotion]);
}

export function scaleCount(base: number, particleScale: number): number {
  return Math.max(24, Math.round(base * particleScale));
}
