/** Deterministic 32-bit PRNG. Same seed always produces the same universe. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, alpha: number): number {
  return from + (to - from) * alpha;
}

/**
 * Frame-rate independent damping.
 * `lambda` is the rate of approach, `delta` the frame time in seconds.
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  delta: number,
): number {
  return lerp(current, target, 1 - Math.exp(-lambda * delta));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Uniformly distributed point on a sphere of the given radius. */
export function pointOnSphere(
  random: () => number,
  radius: number,
): [number, number, number] {
  const u = random() * 2 - 1;
  const theta = random() * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  return [radius * r * Math.cos(theta), radius * u, radius * r * Math.sin(theta)];
}

export function randomRange(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}
