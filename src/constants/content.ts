import type { GalleryRecord, ProjectRecord } from '@/types';

export const PROJECTS: readonly ProjectRecord[] = [
  {
    id: 'aurora-engine',
    title: 'Aurora Engine',
    summary: 'Real-time volumetric renderer for atmospheric scattering.',
    detail:
      'A GPU-first scattering model that keeps a full atmosphere pass under two milliseconds by baking optical depth into a lookup volume and re-projecting it across frames. Built for scenes that need to stay cinematic on a laptop.',
    year: '2025',
    stack: ['WebGL2', 'GLSL', 'TypeScript'],
  },
  {
    id: 'orbital-cms',
    title: 'Orbital',
    summary: 'Content system where every document has a physical position.',
    detail:
      'Documents live on a spatial canvas instead of a tree. Relationships are drawn as orbits, and search is a camera move rather than a list. Ships with a headless API and an editor that never blocks on save.',
    year: '2024',
    stack: ['Next.js', 'Postgres', 'tRPC'],
  },
  {
    id: 'signal-lab',
    title: 'Signal Lab',
    summary: 'Audio-reactive visual toolkit for live performance.',
    detail:
      'Analyses incoming audio on a worklet thread, exposes a stable feature bus, and drives shader uniforms with spring physics so visuals never snap on a transient. Used across a full club tour without a dropped frame.',
    year: '2024',
    stack: ['Web Audio', 'Three.js', 'Rust'],
  },
  {
    id: 'cartograph',
    title: 'Cartograph',
    summary: 'Procedural world generator with deterministic seeds.',
    detail:
      'Every world is reproducible from a single integer. Terrain, weather and settlement placement share one noise field, which keeps generation coherent and lets designers iterate without re-baking assets.',
    year: '2023',
    stack: ['Rust', 'WASM', 'React'],
  },
  {
    id: 'quiet-metrics',
    title: 'Quiet Metrics',
    summary: 'Analytics that fit in a single request and no cookies.',
    detail:
      'A privacy-first measurement layer that aggregates on the edge, stores nothing identifying, and renders dashboards from pre-rolled summaries. Under four kilobytes on the client.',
    year: '2023',
    stack: ['Edge Runtime', 'ClickHouse'],
  },
  {
    id: 'driftwood',
    title: 'Driftwood',
    summary: 'Motion library for interfaces that should feel weighted.',
    detail:
      'A small spring and interpolation kit with an emphasis on mass and damping over duration. Every preset was tuned by hand against reference footage rather than generated from curves.',
    year: '2022',
    stack: ['TypeScript', 'Framer Motion'],
  },
];

export const GALLERY: readonly GalleryRecord[] = [
  {
    id: 'violet-drift',
    title: 'Violet Drift',
    caption: 'Long exposure of the outer dust lane.',
    palette: ['#7A4DFF', '#3E74FF'],
  },
  {
    id: 'ion-tide',
    title: 'Ion Tide',
    caption: 'Charged particles folding around a magnetosphere.',
    palette: ['#6CF6FF', '#0B1026'],
  },
  {
    id: 'ember-field',
    title: 'Ember Field',
    caption: 'A young star clearing its nursery.',
    palette: ['#FFD76A', '#7A4DFF'],
  },
  {
    id: 'quiet-arm',
    title: 'Quiet Arm',
    caption: 'The far spiral arm, twelve hours of stacking.',
    palette: ['#3E74FF', '#050816'],
  },
  {
    id: 'glass-sea',
    title: 'Glass Sea',
    caption: 'Frozen methane plains under a low sun.',
    palette: ['#7AF5FF', '#1f6fb8'],
  },
  {
    id: 'last-light',
    title: 'Last Light',
    caption: 'The final frame before the relay went dark.',
    palette: ['#FFD76A', '#050816'],
  },
];

export const ORIGIN_COPY = {
  heading: 'Cosmic Archive',
  body: 'This is not a page. It is a small solar system, rendered in real time, and everything worth reading is somewhere inside it. Open the chart, pick a light, and travel to it.',
  hints: [
    'Drag to look around. Scroll to change your distance.',
    'Press M for the galaxy chart, S for the station, Escape to release focus.',
    'Hold the cursor still on empty sky. The stars will connect.',
  ],
} as const;

export const LIBRARY_COPY = {
  heading: 'The Library Moon',
  body: 'The archive keeps three kinds of record: what was built, what was learned, and what was abandoned. All three are stored here, in crystal, because crystal outlasts the people who write to it.',
  facts: [
    { label: 'Established', value: '2019' },
    { label: 'Records held', value: '10,486' },
    { label: 'Rebuilds survived', value: '7' },
    { label: 'Uptime', value: '99.98%' },
  ],
  principles: [
    'Correctness before spectacle. The effect never outranks the frame rate.',
    'One responsibility per system, so the universe can be repaired in pieces.',
    'Every surface should reward a second look, and never demand one.',
  ],
} as const;

export const COMMS_COPY = {
  heading: 'Communication Station',
  body: 'Relay is live. Messages are queued locally and transmitted on the next window — nothing leaves this session without your action.',
  channels: [
    { label: 'Primary band', value: 'hello@cosmic-archive.example' },
    { label: 'Short range', value: '@cosmicarchive' },
    { label: 'Response window', value: '24–48 hours' },
  ],
} as const;

export const BLACKHOLE_COPY = {
  heading: 'The Anomaly',
  body: 'You found the part of the archive that was not indexed. Time dilates at the disk edge, so anything written here arrives out of order. Read it anyway.',
  fragments: [
    'The first version of this system had no planets. It was a list.',
    'Every discovery you logged is stored on your own machine. Nothing was sent anywhere.',
    'The universe is procedural, but the seed is fixed — you and everyone else see the same sky.',
    'There is no seventh planet. Stop looking. (Keep looking.)',
  ],
} as const;
