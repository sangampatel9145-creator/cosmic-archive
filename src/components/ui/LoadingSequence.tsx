'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { GlowButton } from '@/components/ui/GlowButton';
import { ORIGIN_COPY } from '@/constants/content';
import { PALETTE, TIMING } from '@/constants/theme';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';

const TITLE = 'COSMIC ARCHIVE';

function EnergyRing(): JSX.Element {
  return (
    <div className="relative h-16 w-16" aria-hidden>
      <motion.span
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: `${PALETTE.cyan}55` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
      />
      <motion.span
        className="absolute inset-2 rounded-full border border-dashed"
        style={{ borderColor: `${PALETTE.accent}66` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 9, ease: 'linear', repeat: Infinity }}
      />
      <motion.span
        className="absolute inset-[42%] rounded-full"
        style={{ background: PALETTE.cyan }}
        animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.15, 0.85] }}
        transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
      />
    </div>
  );
}

export function LoadingSequence(): JSX.Element {
  const phase = useUniverseStore((state) => state.phase);
  const setPhase = useUniverseStore((state) => state.setPhase);
  const beginExploration = useUniverseStore((state) => state.beginExploration);
  const hasVisitedBefore = useUniverseStore((state) => state.hasVisitedBefore);
  const [showTitle, setShowTitle] = useState(false);

  // Screen stays black, then the universe fades up before any wording appears.
  useEffect(() => {
    if (phase !== 'boot') return;
    const toTitle = window.setTimeout(() => setPhase('title'), TIMING.bootDelayMs);
    const toWords = window.setTimeout(
      () => setShowTitle(true),
      TIMING.bootDelayMs + TIMING.titleRevealMs,
    );
    return () => {
      window.clearTimeout(toTitle);
      window.clearTimeout(toWords);
    };
  }, [phase, setPhase]);

  const isVisible = phase === 'boot' || phase === 'title';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(18px)' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto fixed inset-0 z-[60] flex flex-col items-center justify-center px-6"
        >
          {/* The black curtain lifts to reveal the live scene behind it. */}
          <motion.div
            className="absolute inset-0 bg-[#02030a]"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'boot' ? 1 : 0 }}
            transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
          />

          <div className="relative flex flex-col items-center text-center">
            <AnimatePresence>
              {!showTitle && (
                <motion.div
                  key="ring"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.8 }}
                >
                  <EnergyRing />
                </motion.div>
              )}
            </AnimatePresence>

            {showTitle && (
              <>
                <h1 className="flex flex-wrap justify-center font-display text-[2.6rem] leading-none tracking-[0.16em] text-white sm:text-6xl md:text-7xl">
                  {TITLE.split('').map((character, index) => (
                    <motion.span
                      key={`${character}-${index}`}
                      initial={{ opacity: 0, y: 26, filter: 'blur(14px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{
                        delay: index * 0.045,
                        duration: 1.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={character === ' ' ? 'w-4 sm:w-6' : undefined}
                    >
                      {character === ' ' ? '\u00A0' : character}
                    </motion.span>
                  ))}
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.42em] text-[#7AF5FF]/70"
                >
                  Explore the Infinite
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.35, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-11"
                >
                  <GlowButton
                    onClick={() => {
                      audioEngine.resume();
                      beginExploration();
                    }}
                  >
                    {hasVisitedBefore ? 'Resume Journey' : 'Begin Exploration'}
                  </GlowButton>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.1, duration: 1.4 }}
                  className="mt-10 max-w-sm text-[0.78rem] leading-relaxed text-white/35"
                >
                  {ORIGIN_COPY.hints[0]}
                </motion.p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
