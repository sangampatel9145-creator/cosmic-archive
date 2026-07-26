'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { DestinationContent } from '@/components/content/DestinationContent';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DESTINATION_MAP } from '@/constants/destinations';
import { useUniverseStore } from '@/lib/store';

/**
 * The floating dossier for the current destination. It only mounts once the
 * camera has settled, so content never appears mid-flight.
 */
export function ContentPanel(): JSX.Element {
  const phase = useUniverseStore((state) => state.phase);
  const focus = useUniverseStore((state) => state.focus);
  const isPanelOpen = useUniverseStore((state) => state.isPanelOpen);
  const setPanelOpen = useUniverseStore((state) => state.setPanelOpen);

  const isVisible = phase === 'exploring' && isPanelOpen && focus !== null;
  const destination = focus ? DESTINATION_MAP[focus] : null;

  return (
    <AnimatePresence mode="wait">
      {isVisible && destination && (
        <motion.div
          key={destination.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-auto w-full max-w-md"
        >
          <GlassPanel strong floating={false} className="grain">
            <div className="scroll-region max-h-[62vh] p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-eyebrow">{destination.designation}</p>
                  <h2 className="mt-2 font-display text-[1.75rem] leading-tight text-white">
                    {destination.name}
                  </h2>
                  <p className="mt-1.5 text-[0.8rem] italic text-white/40">
                    {destination.tagline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Collapse dossier"
                  className="shrink-0 rounded-full border border-white/10 p-2 text-white/50 transition-colors hover:border-[#7AF5FF]/40 hover:text-white"
                >
                  <ChevronDown size={15} />
                </button>
              </div>

              <div className="hairline my-6 opacity-50" />

              <DestinationContent id={destination.id} />

              <p className="mt-7 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.16em] text-white/25">
                {destination.ambience}
              </p>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
