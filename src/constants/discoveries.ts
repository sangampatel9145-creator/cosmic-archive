import type { Achievement, Discovery, DiscoveryId } from '@/types';

export const DISCOVERIES: readonly Discovery[] = [
  {
    id: 'first-contact',
    title: 'First Contact',
    description: 'You left the outer dark and entered the system.',
  },
  {
    id: 'constellation',
    title: 'Constellation Traced',
    description: 'Held still long enough for the stars to draw themselves.',
  },
  {
    id: 'satellite-signal',
    title: 'Orphan Signal',
    description: 'A derelict satellite still broadcasting on an old band.',
  },
  {
    id: 'deep-space',
    title: 'Edge Of The Chart',
    description: 'You flew past the last mapped orbit and kept going.',
  },
  {
    id: 'asteroid-relic',
    title: 'Belt Relic',
    description: 'Something manufactured, tumbling among the rocks.',
  },
  {
    id: 'code-galaxy',
    title: 'Spectrum Shift',
    description: 'The universe answered to a word and changed colour.',
  },
  {
    id: 'code-warp',
    title: 'Manual Override',
    description: 'You triggered a jump without touching the map.',
  },
  {
    id: 'code-archive',
    title: 'The Archive Itself',
    description: 'A room that was never on any chart.',
  },
  {
    id: 'idle-whale',
    title: 'The Long Swimmer',
    description: 'Stayed still long enough to see something enormous pass.',
  },
  {
    id: 'moon-tap',
    title: 'Seven Knocks',
    description: 'Someone waved back from the surface.',
  },
] as const;

export const DISCOVERY_MAP: Readonly<Record<DiscoveryId, Discovery>> =
  DISCOVERIES.reduce(
    (acc, discovery) => {
      acc[discovery.id] = discovery;
      return acc;
    },
    {} as Record<DiscoveryId, Discovery>,
  );

/** Number of discoveries + full visitation required before the anomaly appears. */
export const BLACK_HOLE_DISCOVERY_THRESHOLD = 3;

export const TYPED_CODES = {
  galaxy: 'galaxy',
  warp: 'warp',
  archive: 'archive',
} as const;

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Reach a second destination.',
    isEarned: ({ visited }) => visited.length >= 2,
  },
  {
    id: 'cartographer',
    title: 'Cartographer',
    description: 'Chart every visible world.',
    isEarned: ({ visited }) => visited.length >= 5,
  },
  {
    id: 'astronomer',
    title: 'Astronomer',
    description: 'Trace a constellation.',
    isEarned: ({ discoveries }) => discoveries.includes('constellation'),
  },
  {
    id: 'secret-finder',
    title: 'Secret Finder',
    description: 'Log three discoveries.',
    isEarned: ({ discoveries }) => discoveries.length >= 3,
  },
  {
    id: 'deep-space-traveler',
    title: 'Deep Space Traveler',
    description: 'Fly beyond the outer orbit.',
    isEarned: ({ discoveries }) => discoveries.includes('deep-space'),
  },
  {
    id: 'galaxy-walker',
    title: 'Galaxy Walker',
    description: 'Reach the anomaly.',
    isEarned: ({ blackHoleUnlocked }) => blackHoleUnlocked,
  },
] as const;
