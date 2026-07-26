'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { PALETTE } from '@/constants/theme';
import { useOrbitClock } from '@/hooks/useOrbitClock';
import { useUniverseStore } from '@/lib/store';
import { getAvailableDestinations } from '@/lib/unlock';
import { orbitAngle } from '@/utils/orbit';

const VIEW = 200;
const CENTRE = VIEW / 2;
const MAX_ORBIT = 330;
const CHART_RADIUS = 88;

function project(orbitRadius: number, angle: number): { x: number; y: number } {
  const scaled = (orbitRadius / MAX_ORBIT) * CHART_RADIUS;
  return {
    x: CENTRE + Math.cos(angle) * scaled,
    // Foreshortened so the chart reads as a tilted plane.
    y: CENTRE + Math.sin(angle) * scaled * 0.42,
  };
}

export function Minimap(): JSX.Element {
  const elapsed = useOrbitClock();
  const focus = useUniverseStore((state) => state.focus);
  const visited = useUniverseStore((state) => state.visited);
  const blackHoleUnlocked = useUniverseStore((state) => state.blackHoleUnlocked);
  const travelTo = useUniverseStore((state) => state.travelTo);
  const toggleMap = useUniverseStore((state) => state.toggleMap);

  const discoveries = useUniverseStore((state) => state.discoveries);

  const available = useMemo(
    () => getAvailableDestinations({ discoveries, blackHoleUnlocked }),
    [blackHoleUnlocked, discoveries],
  );

  const bodies = useMemo(
    () =>
      available.map((destination) => ({
        destination,
        point: project(destination.orbitRadius, orbitAngle(destination.id, elapsed)),
      })),
    [available, elapsed],
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel pointer-events-auto w-[228px] p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-eyebrow">Local Chart</p>
        <button
          type="button"
          onClick={() => toggleMap(true)}
          className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/45 transition-colors hover:text-[#7AF5FF]"
        >
          Expand
        </button>
      </div>

      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="h-[150px] w-full"
        role="img"
        aria-label="Chart of the local system showing your current position"
      >
        <defs>
          <radialGradient id="minimap-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={PALETTE.gold} stopOpacity="0.9" />
            <stop offset="100%" stopColor={PALETTE.gold} stopOpacity="0" />
          </radialGradient>
        </defs>

        {available.map(
          (destination) => (
            <ellipse
              key={`orbit-${destination.id}`}
              cx={CENTRE}
              cy={CENTRE}
              rx={(destination.orbitRadius / MAX_ORBIT) * CHART_RADIUS}
              ry={(destination.orbitRadius / MAX_ORBIT) * CHART_RADIUS * 0.42}
              fill="none"
              stroke={PALETTE.galaxy}
              strokeOpacity={0.18}
              strokeWidth={0.6}
            />
          ),
        )}

        <circle cx={CENTRE} cy={CENTRE} r={16} fill="url(#minimap-core)" />
        <circle cx={CENTRE} cy={CENTRE} r={3} fill={PALETTE.gold} />

        {/* Radar sweep */}
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={CHART_RADIUS}
          fill="none"
          stroke={PALETTE.cyan}
          strokeOpacity={0.28}
          strokeWidth={0.8}
          className="origin-center animate-radar"
        />

        {bodies.map(({ destination, point }) => {
          const isFocus = focus === destination.id;
          const isVisited = visited.includes(destination.id);
          const isAnomaly = destination.hidden;
          return (
            <g key={destination.id}>
              {isFocus && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={7}
                  fill="none"
                  stroke={PALETTE.cyan}
                  strokeWidth={0.9}
                  strokeOpacity={0.75}
                />
              )}
              <circle
                cx={point.x}
                cy={point.y}
                r={isAnomaly ? 4 : 3.2}
                fill={
                  isAnomaly
                    ? PALETTE.gold
                    : isVisited
                      ? PALETTE.cyan
                      : 'rgba(255,255,255,0.42)'
                }
                className="cursor-pointer"
                onClick={() => travelTo(destination.id)}
              />
            </g>
          );
        })}
      </svg>

      <p className="mt-1 truncate font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/45">
        {focus ? `◎ ${focus}` : 'awaiting fix'}
      </p>
    </motion.div>
  );
}
