export const PALETTE = {
  primary: '#050816',
  secondary: '#0B1026',
  accent: '#6D5DF6',
  glow: '#6CF6FF',
  highlight: '#FFFFFF',
  nebula: '#7A4DFF',
  galaxy: '#3E74FF',
  cyan: '#7AF5FF',
  gold: '#FFD76A',
} as const;

export const CAMERA = {
  fov: 52,
  near: 0.1,
  far: 4000,
  startPosition: [0, 46, 210] as const,
  titlePosition: [0, 14, 86] as const,
  orbitHeight: 1.1,
  orbitDistanceFactor: 4.2,
  minDistance: 6,
  maxRadius: 380,
  approachDamping: 1.35,
  lookDamping: 2.1,
  idleDrift: 0.55,
  scrollZoomRange: [0.72, 4.2] as const,
} as const;

export const WARP = {
  minDuration: 2.0,
  maxDuration: 3.6,
  streakCount: 900,
  tunnelRadius: 12,
} as const;

export const SCENE = {
  starLayers: [
    { count: 2600, radius: 900, size: 2.1, depth: 0.35 },
    { count: 1700, radius: 1500, size: 1.5, depth: 0.6 },
    { count: 900, radius: 2400, size: 1.1, depth: 1 },
  ],
  dustCount: 1400,
  asteroidCount: 260,
  cometInterval: [7, 19] as const,
  nebulaLayers: 4,
  galaxyCount: 5,
} as const;

export const QUALITY_SCALE = {
  low: { particles: 0.32, dpr: [0.75, 1] as const, bloom: false, shadows: false },
  medium: { particles: 0.62, dpr: [1, 1.4] as const, bloom: true, shadows: false },
  high: { particles: 1, dpr: [1, 1.9] as const, bloom: true, shadows: true },
} as const;

export const TIMING = {
  bootDelayMs: 800,
  titleRevealMs: 1400,
  contentFadeMs: 900,
  idleHintMs: 22_000,
  longIdleMs: 120_000,
  constellationHoldMs: 1200,
  toastMs: 5200,
} as const;

/** Root font sizes for the accessibility text-scale control. */
export const TEXT_SCALE_ROOT = {
  standard: '16px',
  large: '18px',
  largest: '20px',
} as const;

export const STORAGE_KEY = 'cosmic-archive.state.v1';
