'use client';

import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { BookOpen, Lock, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { DESTINATION_MAP } from '@/constants/destinations';
import { ACHIEVEMENTS, DISCOVERIES } from '@/constants/discoveries';
import { CREDITS, LORE_FRAGMENTS } from '@/constants/lore';
import { useUniverseStore } from '@/lib/store';

type Tab = 'log' | 'lore' | 'route' | 'credits';

const TABS: readonly { readonly id: Tab; readonly label: string }[] = [
  { id: 'log', label: 'Log' },
  { id: 'lore', label: 'Fragments' },
  { id: 'route', label: 'Route' },
  { id: 'credits', label: 'Credits' },
];

const fade: MotionProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

export function Journal(): JSX.Element {
  const isOpen = useUniverseStore((state) => state.isJournalOpen);
  const toggleJournal = useUniverseStore((state) => state.toggleJournal);
  const discoveries = useUniverseStore((state) => state.discoveries);
  const visited = useUniverseStore((state) => state.visited);
  const blackHoleUnlocked = useUniverseStore((state) => state.blackHoleUnlocked);
  const [tab, setTab] = useState<Tab>('log');

  const foundCount = discoveries.length;
  const totalCount = DISCOVERIES.length;

  const unlockedLore = useMemo(
    () => LORE_FRAGMENTS.filter((fragment) => discoveries.includes(fragment.unlockedBy)),
    [discoveries],
  );

  const earnedAchievements = useMemo(
    () =>
      ACHIEVEMENTS.filter((achievement) =>
        achievement.isEarned({ visited, discoveries, blackHoleUnlocked }),
      ),
    [blackHoleUnlocked, discoveries, visited],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="journal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/76 px-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Discovery journal"
        >
          <GlassPanel
            strong
            floating={false}
            className="grain flex max-h-[90vh] w-full max-w-2xl flex-col p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-eyebrow">Archive record</p>
                <h2 className="mt-2 flex items-center gap-3 font-display text-2xl text-white">
                  <BookOpen size={19} className="text-[#7AF5FF]" />
                  Journal
                </h2>
              </div>
              <button
                type="button"
                onClick={() => toggleJournal(false)}
                aria-label="Close journal"
                className="rounded-full border border-white/10 p-2 text-white/60 transition-colors hover:border-[#7AF5FF]/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress rail */}
            <div className="mt-6">
              <div className="flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/40">
                <span>{foundCount} of {totalCount} logged</span>
                <span>{visited.length} charted</span>
              </div>
              <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#6D5DF6] to-[#7AF5FF]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(foundCount / totalCount) * 100}%` }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Journal sections"
              className="mt-6 flex gap-2"
            >
              {TABS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === entry.id}
                  onClick={() => setTab(entry.id)}
                  className={`rounded-full border px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-all duration-500 ${
                    tab === entry.id
                      ? 'border-[#7AF5FF]/45 bg-[#6CF6FF]/12 text-white'
                      : 'border-white/8 text-white/45 hover:text-white/80'
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <div className="scroll-region mt-6 flex-1 pr-1">
              <AnimatePresence mode="wait">
                {tab === 'log' && (
                  <motion.div key="log" {...fade} className="space-y-2.5">
                    {DISCOVERIES.map((discovery) => {
                      const isFound = discoveries.includes(discovery.id);
                      return (
                        <div
                          key={discovery.id}
                          className={`rounded-2xl border p-4 ${
                            isFound
                              ? 'border-[#7AF5FF]/25 bg-[#6CF6FF]/[0.04]'
                              : 'border-white/8 bg-white/[0.015]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {!isFound && (
                              <Lock size={12} className="shrink-0 text-white/25" />
                            )}
                            <p
                              className={`font-display text-sm ${
                                isFound ? 'text-white' : 'text-white/30'
                              }`}
                            >
                              {isFound ? discovery.title : 'Unlogged'}
                            </p>
                          </div>
                          <p
                            className={`mt-1.5 text-[0.78rem] leading-relaxed ${
                              isFound ? 'text-white/50' : 'text-white/20'
                            }`}
                          >
                            {isFound
                              ? discovery.description
                              : 'Something here has not been found yet.'}
                          </p>
                        </div>
                      );
                    })}

                    <div className="pt-4">
                      <p className="text-eyebrow">Commendations</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ACHIEVEMENTS.map((achievement) => {
                          const isEarned = earnedAchievements.some(
                            (item) => item.id === achievement.id,
                          );
                          return (
                            <span
                              key={achievement.id}
                              title={achievement.description}
                              className={`rounded-full border px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] ${
                                isEarned
                                  ? 'border-[#FFD76A]/35 text-[#FFD76A]'
                                  : 'border-white/8 text-white/25'
                              }`}
                            >
                              {achievement.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {tab === 'lore' && (
                  <motion.div key="lore" {...fade} className="space-y-3">
                    {unlockedLore.length === 0 && (
                      <p className="py-8 text-center font-mono text-[0.66rem] uppercase tracking-[0.18em] text-white/30">
                        No fragments recovered yet
                      </p>
                    )}
                    {unlockedLore.map((fragment) => (
                      <article
                        key={fragment.id}
                        className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"
                      >
                        <p className="text-eyebrow">{fragment.title}</p>
                        <p className="mt-3 text-[0.84rem] leading-relaxed text-white/65">
                          {fragment.body}
                        </p>
                      </article>
                    ))}
                    {unlockedLore.length < LORE_FRAGMENTS.length && (
                      <p className="pt-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/25">
                        {LORE_FRAGMENTS.length - unlockedLore.length} fragments still
                        sealed
                      </p>
                    )}
                  </motion.div>
                )}

                {tab === 'route' && (
                  <motion.div key="route" {...fade}>
                    {visited.length === 0 ? (
                      <p className="py-8 text-center font-mono text-[0.66rem] uppercase tracking-[0.18em] text-white/30">
                        No route recorded
                      </p>
                    ) : (
                      <ol className="relative space-y-5 border-l border-white/10 pl-6">
                        {visited.map((id, index) => {
                          const destination = DESTINATION_MAP[id];
                          return (
                            <li key={id} className="relative">
                              <span
                                aria-hidden
                                className="absolute -left-[1.72rem] top-1.5 h-2 w-2 rounded-full bg-[#7AF5FF]"
                              />
                              <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/35">
                                Leg {String(index + 1).padStart(2, '0')} ·{' '}
                                {destination.designation}
                              </p>
                              <p className="mt-1 font-display text-base text-white">
                                {destination.name}
                              </p>
                              <p className="mt-1 text-[0.78rem] leading-relaxed text-white/45">
                                {destination.tagline}
                              </p>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </motion.div>
                )}

                {tab === 'credits' && (
                  <motion.div key="credits" {...fade}>
                    <h3 className="font-display text-xl text-white">
                      {CREDITS.heading}
                    </h3>
                    <p className="mt-3 text-[0.84rem] leading-relaxed text-white/60">
                      {CREDITS.body}
                    </p>
                    <dl className="mt-6 space-y-2">
                      {CREDITS.entries.map((entry) => (
                        <div
                          key={entry.label}
                          className="flex items-baseline justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3"
                        >
                          <dt className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/35">
                            {entry.label}
                          </dt>
                          <dd className="text-right font-mono text-[0.72rem] text-[#7AF5FF]">
                            {entry.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
