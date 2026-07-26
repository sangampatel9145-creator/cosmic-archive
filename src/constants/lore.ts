import type { LoreFragment, SpaceWeatherEvent, SpaceWeatherKind } from '@/types';

/**
 * Lore is deliberately sparse and unlocked by exploration rather than handed
 * out. Each fragment is tied to the discovery that earns it.
 */
export const LORE_FRAGMENTS: readonly LoreFragment[] = [
  {
    id: 'lore-survey',
    title: 'Survey Note 001',
    body: 'The system was catalogued twice. The first survey recorded five bodies. The second recorded nine. Neither team was willing to revise their figure, so both records were kept.',
    unlockedBy: 'first-contact',
  },
  {
    id: 'lore-constellation',
    title: 'On Pattern Finding',
    body: 'Constellations are not out there. They are a habit of the observer — a refusal to accept that bright things can be unrelated. We kept the habit anyway. It makes the dark navigable.',
    unlockedBy: 'constellation',
  },
  {
    id: 'lore-relay',
    title: 'Relay Log, Final Entry',
    body: 'Power reserve at four percent. Nobody is listening on this band any more, but the transmitter is the only part of me still working, so I will keep it running until it is not.',
    unlockedBy: 'satellite-signal',
  },
  {
    id: 'lore-belt',
    title: 'Manifest Fragment',
    body: 'Cargo listed as "archive materials, non-perishable". The belt has been grinding the crate down for a century and the contents are still legible. Whoever packed it understood the assignment.',
    unlockedBy: 'asteroid-relic',
  },
  {
    id: 'lore-edge',
    title: 'Beyond The Last Orbit',
    body: 'There is no boundary. There is only the point where the chart stops being useful and you have to start paying attention again.',
    unlockedBy: 'deep-space',
  },
  {
    id: 'lore-anomaly',
    title: 'Unindexed',
    body: 'Everything written near the disk arrives out of order. This sentence was recorded last and read first. It has been trying to warn you since before you asked.',
    unlockedBy: 'code-archive',
  },
  {
    id: 'lore-swimmer',
    title: 'The Long Swimmer',
    body: 'Reported by three separate crews across sixty years, always while waiting for something else. Never photographed. The official position is that it does not exist. The unofficial position is that you have to be still.',
    unlockedBy: 'idle-whale',
  },
];

export const SPACE_WEATHER: Readonly<Record<SpaceWeatherKind, SpaceWeatherEvent>> = {
  'meteor-shower': {
    kind: 'meteor-shower',
    title: 'Meteor shower',
    description: 'Debris entering the inner system.',
    durationSeconds: 14,
  },
  'solar-flare': {
    kind: 'solar-flare',
    title: 'Solar flare',
    description: 'The star is venting. Instruments are saturating.',
    durationSeconds: 9,
  },
  'aurora-burst': {
    kind: 'aurora-burst',
    title: 'Aurora burst',
    description: 'Charged particles folding into the magnetosphere.',
    durationSeconds: 16,
  },
  'alien-signal': {
    kind: 'alien-signal',
    title: 'Unattributed signal',
    description: 'Narrowband, repeating, origin unresolved.',
    durationSeconds: 11,
  },
};

export const WEATHER_KINDS: readonly SpaceWeatherKind[] = [
  'meteor-shower',
  'solar-flare',
  'aurora-burst',
  'alien-signal',
];

/** Seconds between space weather rolls, and the chance each roll fires. */
export const WEATHER_ROLL_SECONDS = 42;
export const WEATHER_CHANCE = 0.55;

export const CREDITS = {
  heading: 'Cosmic Archive',
  body: 'Built as a single-page interactive universe. Every planet surface, nebula, ring and star is generated in a fragment shader at runtime; every sound is synthesised by the Web Audio API. There are no image or audio assets in this project.',
  entries: [
    { label: 'Rendering', value: 'Three.js · React Three Fiber · GLSL' },
    { label: 'Framework', value: 'Next.js App Router · TypeScript strict' },
    { label: 'Motion', value: 'Framer Motion · custom damping' },
    { label: 'State', value: 'Zustand · localStorage' },
    { label: 'Typography', value: 'Space Grotesk · Inter · JetBrains Mono' },
    { label: 'Assets', value: 'None — everything is procedural' },
  ],
} as const;

export const SECRET_COPY = {
  frost: {
    body: 'Sealed since the second survey. The plains hold every impact they have ever taken, which makes the surface the most complete record in the system — and the least readable, because nothing here is sorted.',
    notes: [
      'Surface temperature stable to within two degrees for eleven thousand years.',
      'No atmosphere, so nothing erodes and nothing is lost.',
      'The only body in the archive that has never been rewritten.',
    ],
  },
  crystal: {
    body: 'The crust grew rather than cooled. It resonates at a single frequency, and every structure on it is a harmonic of that note. Standing on the surface is reported to be uncomfortable for reasons nobody has isolated.',
    notes: [
      'Lattice growth is still ongoing and visible from orbit.',
      'The ring is shed material, not captured debris.',
      'Attempts to sample it produce fragments that continue to ring.',
    ],
  },
  quantum: {
    body: 'Measured twice, resolved differently both times. The archive stores both results because discarding either one would be a decision the data does not support.',
    notes: [
      'Two moons are recorded. It may be one moon recorded twice.',
      'Rotation rate depends on when you start counting.',
      'Every visitor logs a slightly different radius. Yours is now on file.',
    ],
  },
} as const;
