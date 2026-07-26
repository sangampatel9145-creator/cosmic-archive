'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Compass, Settings2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { DESTINATION_MAP } from '@/constants/destinations';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';

function ControlButton({
  label,
  onClick,
  children,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        audioEngine.play('select');
        onClick();
      }}
      onMouseEnter={() => audioEngine.play('hover')}
      className="glass-panel flex items-center gap-2.5 px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/65 transition-colors duration-500 hover:text-white"
    >
      {children}
    </button>
  );
}

export function HUD(): JSX.Element {
  const phase = useUniverseStore((state) => state.phase);
  const focus = useUniverseStore((state) => state.focus);
  const toggleMap = useUniverseStore((state) => state.toggleMap);
  const toggleSettings = useUniverseStore((state) => state.toggleSettings);
  const toggleJournal = useUniverseStore((state) => state.toggleJournal);
  const weather = useUniverseStore((state) => state.weather);
  const isPanelOpen = useUniverseStore((state) => state.isPanelOpen);
  const setPanelOpen = useUniverseStore((state) => state.setPanelOpen);

  const isActive = phase === 'exploring' || phase === 'travelling';
  const destination = focus ? DESTINATION_MAP[focus] : null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto flex flex-wrap items-center gap-3"
        >
          <ControlButton label="Open galaxy chart" onClick={() => toggleMap(true)}>
            <Compass size={13} className="text-[#7AF5FF]" />
            Chart
          </ControlButton>

          <ControlButton label="Open station settings" onClick={() => toggleSettings(true)}>
            <Settings2 size={13} className="text-[#7AF5FF]" />
            Station
          </ControlButton>

          <ControlButton label="Open discovery journal" onClick={() => toggleJournal(true)}>
            <BookOpen size={13} className="text-[#7AF5FF]" />
            Journal
          </ControlButton>

          {destination && !isPanelOpen && phase === 'exploring' && (
            <ControlButton
              label={`Show dossier for ${destination.name}`}
              onClick={() => setPanelOpen(true)}
            >
              Dossier
            </ControlButton>
          )}

          <div className="glass-panel px-4 py-2.5">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
              {phase === 'travelling' ? (
                <span className="text-[#7AF5FF]">Warping…</span>
              ) : (
                destination?.designation ?? 'in transit'
              )}
            </p>
          </div>

          <AnimatePresence>
            {weather && (
              <motion.div
                key={weather.kind}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel px-4 py-2.5"
              >
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#FFD76A]">
                  {weather.title}
                </p>
                <p className="mt-1 text-[0.68rem] text-white/45">
                  {weather.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
