'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlowButton } from '@/components/ui/GlowButton';
import { PALETTE } from '@/constants/theme';
import { useOrbitClock } from '@/hooks/useOrbitClock';
import { useUniverseStore } from '@/lib/store';
import { getAvailableDestinations } from '@/lib/unlock';
import { orbitAngle } from '@/utils/orbit';

const VIEW = 420;
const CENTRE = VIEW / 2;
const MAX_ORBIT = 330;
const CHART_RADIUS = 186;

export function GalaxyMap(): JSX.Element {
  const isOpen = useUniverseStore((state) => state.isMapOpen);
  const toggleMap = useUniverseStore((state) => state.toggleMap);
  const travelTo = useUniverseStore((state) => state.travelTo);
  const focus = useUniverseStore((state) => state.focus);
  const visited = useUniverseStore((state) => state.visited);
  const blackHoleUnlocked = useUniverseStore((state) => state.blackHoleUnlocked);
  const elapsed = useOrbitClock(320);
  const [query, setQuery] = useState('');

  const discoveries = useUniverseStore((state) => state.discoveries);

  const available = useMemo(
    () => getAvailableDestinations({ discoveries, blackHoleUnlocked }),
    [blackHoleUnlocked, discoveries],
  );

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return available;
    return available.filter(
      (destination) =>
        destination.name.toLowerCase().includes(term) ||
        destination.role.toLowerCase().includes(term) ||
        destination.designation.toLowerCase().includes(term),
    );
  }, [available, query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="galaxy-map"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/78 px-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Galaxy chart"
        >
          <GlassPanel
            strong
            floating={false}
            className="grain flex max-h-[92vh] w-full max-w-5xl flex-col gap-6 p-6 md:flex-row md:p-10"
          >
            <div className="relative flex-1">
              <svg
                viewBox={`0 0 ${VIEW} ${VIEW}`}
                className="h-auto w-full"
                role="img"
                aria-label="Interactive chart of all known destinations"
              >
                <defs>
                  <radialGradient id="chart-core" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={PALETTE.gold} stopOpacity="0.95" />
                    <stop offset="100%" stopColor={PALETTE.gold} stopOpacity="0" />
                  </radialGradient>
                </defs>

                {available.map((destination) => (
                  <ellipse
                    key={`route-${destination.id}`}
                    cx={CENTRE}
                    cy={CENTRE}
                    rx={(destination.orbitRadius / MAX_ORBIT) * CHART_RADIUS}
                    ry={(destination.orbitRadius / MAX_ORBIT) * CHART_RADIUS * 0.42}
                    fill="none"
                    stroke={destination.hidden ? PALETTE.gold : PALETTE.galaxy}
                    strokeOpacity={destination.hidden ? 0.3 : 0.2}
                    strokeWidth={0.8}
                    strokeDasharray={destination.hidden ? '4 6' : undefined}
                  />
                ))}

                <circle cx={CENTRE} cy={CENTRE} r={34} fill="url(#chart-core)" />
                <circle cx={CENTRE} cy={CENTRE} r={5} fill={PALETTE.gold} />
                <circle
                  cx={CENTRE}
                  cy={CENTRE}
                  r={CHART_RADIUS}
                  fill="none"
                  stroke={PALETTE.cyan}
                  strokeOpacity={0.22}
                  strokeWidth={1}
                  className="origin-center animate-radar"
                />

                {available.map((destination) => {
                  const angle = orbitAngle(destination.id, elapsed);
                  const scaled =
                    (destination.orbitRadius / MAX_ORBIT) * CHART_RADIUS;
                  const x = CENTRE + Math.cos(angle) * scaled;
                  const y = CENTRE + Math.sin(angle) * scaled * 0.42;
                  const isMatch = matches.some((m) => m.id === destination.id);
                  const isVisited = visited.includes(destination.id);

                  return (
                    <g
                      key={destination.id}
                      className="cursor-pointer"
                      opacity={isMatch ? 1 : 0.22}
                      onClick={() => travelTo(destination.id)}
                    >
                      {focus === destination.id && (
                        <circle
                          cx={x}
                          cy={y}
                          r={13}
                          fill="none"
                          stroke={PALETTE.cyan}
                          strokeWidth={1.1}
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={destination.hidden ? 7 : 5.5}
                        fill={
                          destination.hidden
                            ? PALETTE.gold
                            : isVisited
                              ? PALETTE.cyan
                              : 'rgba(255,255,255,0.5)'
                        }
                      />
                      <text
                        x={x + 12}
                        y={y + 4}
                        fill="rgba(255,255,255,0.72)"
                        fontSize="9"
                        letterSpacing="1.6"
                        className="font-mono uppercase"
                      >
                        {destination.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex w-full flex-col md:w-[300px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-eyebrow">Navigation</p>
                  <h2 className="mt-2 font-display text-2xl text-white">
                    Galaxy Chart
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMap(false)}
                  aria-label="Close chart"
                  className="rounded-full border border-white/10 p-2 text-white/60 transition-colors hover:border-[#7AF5FF]/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <label className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5">
                <Search size={14} className="text-white/40" />
                <span className="sr-only">Search destinations</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search constellations"
                  className="w-full bg-transparent font-mono text-[0.7rem] uppercase tracking-[0.16em] text-white placeholder:text-white/30 focus:outline-none"
                />
              </label>

              <div className="scroll-region mt-5 flex-1 space-y-2 pr-1">
                {matches.map((destination) => (
                  <button
                    key={destination.id}
                    type="button"
                    onClick={() => travelTo(destination.id)}
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-left transition-all duration-500 hover:border-[#7AF5FF]/35 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-base text-white">
                        {destination.name}
                      </p>
                      <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/35">
                        {visited.includes(destination.id) ? 'charted' : 'unknown'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[0.78rem] leading-relaxed text-white/50">
                      {destination.tagline}
                    </p>
                  </button>
                ))}
                {matches.length === 0 && (
                  <p className="px-1 py-6 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/35">
                    No matching signal
                  </p>
                )}
              </div>

              <GlowButton
                variant="ghost"
                className="mt-5 w-full"
                onClick={() => toggleMap(false)}
              >
                Return to view
              </GlowButton>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
