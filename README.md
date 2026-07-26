# COSMIC ARCHIVE

An interactive universe rendered in real time. There are no pages — there is one
solar system, six celestial destinations, and a camera that flies between them.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run typecheck  # tsc --noEmit, strict mode
npm run lint       # eslint via next lint
npm run build      # production build
npm start          # serve the production build
```

**Node 18.17+ is required** (Next.js 14 minimum).

---

## Technology

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript, `strict` + `noUnusedLocals` + `noImplicitOverride` |
| Rendering | Three.js via React Three Fiber, `@react-three/drei`, `@react-three/postprocessing` |
| Shading | Hand-written GLSL (planets, atmospheres, nebulae, rings, warp, black hole) |
| Motion | Framer Motion for DOM, custom damping/spring maths for the camera |
| State | Zustand with `localStorage` persistence |
| Styling | Tailwind CSS with project design tokens |
| Audio | Web Audio API, synthesised at runtime — no media assets |

### A note on version pinning

The brief asks for "latest". The dependency set here is pinned to the **latest
stable combination that is known to work together** — React 18 with R3F v8,
rather than React 19 with R3F v9. R3F v9's React 19 support was still settling
when this was written, and the brief's "zero runtime errors, only stable
production APIs" requirement outranks version recency. Upgrading later is a
contained change: the render systems use documented APIs only.

---

## Structure

```
src/
  app/                  Route files: layout, page, error, not-found
  components/
    content/            Per-destination copy and interactive bodies
    effects/            Cursor orb, constellation tracing
    layout/             ExperienceShell — composes scene + overlays
    navigation/         HUD, minimap, galaxy chart
    planets/            Planet, rings, moons, black hole, planet system
    space/              Canvas root and every render system
    ui/                 Glass panel, glow button, loading, settings, panels
  constants/            Destinations, discoveries, content, theme tokens
  hooks/                Quality tier, idle, pointer velocity, shortcuts, codes
  lib/                  Zustand store, out-of-React frame state
  services/             Synthesised audio engine
  shaders/              GLSL sources
  styles/               Global stylesheet
  types/                Shared domain types
  utils/                Seeded random, damping maths, orbit resolution
public/                 favicon
```

### Architectural decisions worth knowing

**One source of truth for orbits.** Planets are on live orbits, so a planet's
world position is a function of elapsed time. `utils/orbit.ts` resolves it, and
the scene, the camera rig and the chart all call the same function — they can
never disagree about where a planet is.

**Frame state lives outside React.** Values that change every frame (warp
progress, distortion, camera radius) are in `lib/frameState.ts`, a plain mutable
object. Systems read and write it inside `useFrame` without triggering a single
rerender.

**Hydration is deliberate.** The store persists with `skipHydration: true` and is
rehydrated in an effect after mount, and the Canvas is loaded via
`next/dynamic` with `ssr: false`. Server and client markup cannot diverge.

**Resources are disposed explicitly.** Geometries built in `useMemo` and passed
in as props are not owned by the reconciler, so R3F will not free them. The
`useDisposable` hook registers them and releases the GPU buffers on unmount or
when a quality change rebuilds them.

**Everything procedural is seeded.** `createRandom()` is a deterministic
mulberry32 PRNG, so every visitor sees the same sky and no geometry is generated
differently between renders.

---

## The universe

| Destination | Purpose | Character |
| --- | --- | --- |
| The Origin | Welcome | Blue oceans, aurora at both poles, two moons, thin ring |
| The Observatory | Work | Dark metallic crust, twin rings, high emission |
| The Library Moon | About | Aurora-green haze, two fast satellites |
| The Nebula Gallery | Gallery | Violet dust, broad ring system |
| Communication Station | Contact | Volcanic ash, steep polar ring |
| The Black Hole | Secret | Hidden until unlocked |
| The Frozen Moon | Secret | Unlocked by the belt relic |
| The Crystal World | Secret | Unlocked by the orphan signal |
| The Quantum Anomaly | Secret | Unlocked by typing `archive` |

**Unlocking the anomaly** requires visiting all five visible worlds *and* logging
at least three discoveries. The other three hidden bodies each unlock from a
single specific discovery — see `lib/unlock.ts`, which is the only place that
decides what is reachable, so the scene, the minimap and the chart can never
disagree.

### Things that are not signposted

- Hold the cursor still over empty sky — nearby stars connect into a figure.
- Click the derelict satellite (there is one among seven).
- Find the manufactured object tumbling in the asteroid belt.
- Zoom all the way out from an outer world.
- Tap a moon seven times.
- Type `galaxy`, `warp`, or `archive` anywhere.
- Stay completely idle for two minutes.

### Controls

| Input | Action |
| --- | --- |
| Drag / one-finger drag | Orbit the camera |
| Scroll / pinch | Change distance |
| Click a planet | Warp to it |
| `M` | Galaxy chart |
| `S` | Station settings |
| `J` | Discovery journal |
| `←` / `→` | Step to the previous / next unlocked destination |
| `Esc` | Release focus, close overlays |

---

## Performance

Quality is resolved from three inputs: the user's explicit preference, a device
capability probe (`hardwareConcurrency`, `deviceMemory`, pointer type, viewport),
and the OS `prefers-reduced-motion` setting.

| Tier | Particles | DPR | Bloom | Planet segments |
| --- | --- | --- | --- | --- |
| Low | 32% | 0.75–1.0 | off | 32 |
| Medium | 62% | 1.0–1.4 | on | 56 |
| High | 100% | 1.0–1.9 | on | 96 |

Additional measures: `AdaptiveDpr` and `AdaptiveEvents` drop resolution during
movement; all starfields are single draw calls via `BufferGeometry` + points
shaders; asteroids are a single `InstancedMesh`; the warp streak field renders
nothing while `warpProgress` is zero; post-processing effects are *unmounted*
rather than dimmed when disabled, so a disabled effect costs no render pass;
frame deltas are clamped so a background tab cannot produce a huge jump.

---

## Accessibility

- `prefers-reduced-motion` is respected automatically and can also be forced on
  in settings; it halves particle counts and disables bloom and motion blur.
- All overlays are reachable by keyboard, with visible focus rings.
- The custom cursor only replaces the system cursor on fine pointers, and never
  on touch devices.
- Discovery announcements use `role="status"` with `aria-live="polite"`.
- Dialogs use `role="dialog"` and `aria-modal`, with labelled close controls.
- Adjustable text scaling (standard / large / largest) applied at the document
  root, so every rem-based size in the interface follows it.
- Every destination is reachable with the arrow keys alone; no pointer is
  required for any part of the experience.
- A single polite live region announces arrivals, discoveries and space weather
  to screen readers.
- If WebGL is unavailable, the entire archive is rendered as a readable
  document instead of an error.

---

## Deployment

Deploys to Vercel with no configuration. Any Node host works:

```bash
npm run build && npm start
```

### Environment variables

Only one, and it is optional:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata and social cards |

There are no secrets, no external API calls, and no analytics.

### Assets

None. Every texture is generated in a fragment shader, every sound is
synthesised by the Web Audio API, and the only file in `public/` is the favicon.

---

## Known limitations

- **The build has not been executed.** This project was written without network
  access, so `npm install`, `tsc --noEmit` and `next build` have not been run
  against it. The code targets documented, stable APIs throughout, but you
  should run all three before treating it as production-ready.
- Gravitational lensing on the black hole is an artistic approximation — a
  shaded accretion disk with a photon ring and Doppler beaming, not a real
  ray-traced light-bending pass, which would not hold 60 FPS on a laptop.
- Gyroscope camera control is not implemented; touch drag and pinch are.
- The minimap is hidden below the `lg` breakpoint. The galaxy chart is the
  full-featured navigation surface on small screens.
- Space weather is scheduled on a fixed cadence with a probability roll rather
  than modelled from stellar activity — it is set dressing, not simulation.
- Motion blur is expressed through chromatic separation and streak stretching
  during warp rather than a velocity-buffer blur pass, which is far cheaper and
  reads nearly identically at warp speed.

---

## Future directions

- Velocity-buffer motion blur behind a "high" tier flag.
- KTX2/Basis-compressed detail textures layered over the procedural surfaces.
- Additional hidden bodies (frozen moon, crystal world, quantum anomaly) — the
  destination system already supports them via `constants/destinations.ts`.
- A shareable seed so visitors can generate and exchange their own systems.
- Per-destination ambient audio beds layered over the existing drone.
- Timestamped route history (the journal currently records order, not time).

---

## Changelog — Phase 3

**Audit fixes**

- GPU memory leak closed: five components created geometries in `useMemo` and
  never disposed them. Added the `useDisposable` hook and registered every one.
  This mattered most on quality changes, which rebuild the buffers.
- Removed a per-frame `Vector3.clone()` in the dust field (one allocation ×
  particle-field update × 60fps) in favour of a reused scratch vector.
- Destination availability was duplicated in three places with slightly
  different conditions. Consolidated into `lib/unlock.ts`.
- Orbit guide rings were drawn from the full destination list rather than the
  unlocked one, which would have revealed hidden orbits.

**New systems**

- Three secret destinations, each unlocked by a specific discovery.
- Space station rendered as a real orbital object that opens the systems panel.
- Dynamic space weather: four events on a probability cadence, two with a
  physical presence in the scene (meteor shower, solar flare).
- Discovery journal with four sections: log (with sealed entries visible as
  silhouettes), lore fragments, route history, and a credits terminal.
- Seven lore fragments, each gated behind the discovery that earns it.
- Search across the project archive on the Observatory.
- Text scaling, keyboard destination cycling, and a live region for
  assistive technology.
