'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Maximize, RotateCcw, X } from 'lucide-react';
import { useCallback } from 'react';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlowButton } from '@/components/ui/GlowButton';
import { ACHIEVEMENTS } from '@/constants/discoveries';
import { useUniverseStore } from '@/lib/store';
import type { QualityPreference, TextScale } from '@/types';

const QUALITY_OPTIONS: readonly QualityPreference[] = ['auto', 'low', 'medium', 'high'];

const TEXT_SCALES: readonly { readonly id: TextScale; readonly label: string }[] = [
  { id: 'standard', label: 'A' },
  { id: 'large', label: 'A+' },
  { id: 'largest', label: 'A++' },
];

interface ToggleRowProps {
  readonly label: string;
  readonly description: string;
  readonly checked: boolean;
  readonly onChange: (value: boolean) => void;
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: ToggleRowProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-left transition-colors duration-500 hover:border-[#7AF5FF]/30"
    >
      <span>
        <span className="block font-display text-sm text-white">{label}</span>
        <span className="mt-0.5 block text-[0.72rem] leading-relaxed text-white/45">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-500 ${
          checked
            ? 'border-[#7AF5FF]/50 bg-[#6CF6FF]/25'
            : 'border-white/12 bg-white/[0.04]'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full ${
            checked ? 'right-1 bg-[#7AF5FF]' : 'left-1 bg-white/45'
          }`}
        />
      </span>
    </button>
  );
}

export function SettingsPanel(): JSX.Element {
  const isOpen = useUniverseStore((state) => state.isSettingsOpen);
  const toggleSettings = useUniverseStore((state) => state.toggleSettings);
  const settings = useUniverseStore((state) => state.settings);
  const updateSettings = useUniverseStore((state) => state.updateSettings);
  const setQuality = useUniverseStore((state) => state.setQuality);
  const setTextScale = useUniverseStore((state) => state.setTextScale);
  const resetProgress = useUniverseStore((state) => state.resetProgress);
  const visited = useUniverseStore((state) => state.visited);
  const discoveries = useUniverseStore((state) => state.discoveries);
  const blackHoleUnlocked = useUniverseStore((state) => state.blackHoleUnlocked);

  const requestFullscreen = useCallback((): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen().catch(() => {
        /* fullscreen unavailable — silently ignore */
      });
    }
  }, []);

  const earned = ACHIEVEMENTS.filter((achievement) =>
    achievement.isEarned({ visited, discoveries, blackHoleUnlocked }),
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="settings"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/72 px-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Station settings"
        >
          <GlassPanel
            strong
            floating={false}
            className="scroll-region grain max-h-[90vh] w-full max-w-lg p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-eyebrow">Space Station</p>
                <h2 className="mt-2 font-display text-2xl text-white">Systems</h2>
              </div>
              <button
                type="button"
                onClick={() => toggleSettings(false)}
                aria-label="Close settings"
                className="rounded-full border border-white/10 p-2 text-white/60 transition-colors hover:border-[#7AF5FF]/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <section className="mt-7">
              <p className="text-eyebrow">Graphics preset</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setQuality(option)}
                    className={`rounded-xl border px-2 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] transition-all duration-500 ${
                      settings.quality === option
                        ? 'border-[#7AF5FF]/45 bg-[#6CF6FF]/12 text-white'
                        : 'border-white/8 bg-white/[0.02] text-white/45 hover:text-white/80'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <p className="text-eyebrow">Text size</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {TEXT_SCALES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTextScale(option.id)}
                    aria-pressed={settings.textScale === option.id}
                    className={`rounded-xl border px-2 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-all duration-500 ${
                      settings.textScale === option.id
                        ? 'border-[#7AF5FF]/45 bg-[#6CF6FF]/12 text-white'
                        : 'border-white/8 bg-white/[0.02] text-white/45 hover:text-white/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6 space-y-2.5">
              <ToggleRow
                label="Bloom"
                description="Light blooms around bright bodies."
                checked={settings.bloom}
                onChange={(value) => updateSettings({ bloom: value })}
              />
              <ToggleRow
                label="Motion blur"
                description="Applied during warp travel only."
                checked={settings.motionBlur}
                onChange={(value) => updateSettings({ motionBlur: value })}
              />
              <ToggleRow
                label="Reduce motion"
                description="Fewer particles and calmer transitions."
                checked={settings.reduceMotion}
                onChange={(value) => updateSettings({ reduceMotion: value })}
              />
              <ToggleRow
                label="Ambient music"
                description="A synthesised drone. Nothing is downloaded."
                checked={settings.music}
                onChange={(value) => updateSettings({ music: value })}
              />
              <ToggleRow
                label="Sound effects"
                description="Interface tones on hover, select and warp."
                checked={settings.sfx}
                onChange={(value) => updateSettings({ sfx: value })}
              />
            </section>

            <section className="mt-7">
              <p className="text-eyebrow">Log</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ACHIEVEMENTS.map((achievement) => {
                  const isEarned = earned.some((item) => item.id === achievement.id);
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
              <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/35">
                {visited.length} charted · {discoveries.length} discoveries
              </p>
            </section>

            <div className="mt-7 flex flex-wrap gap-3">
              <GlowButton variant="ghost" onClick={requestFullscreen}>
                <span className="flex items-center gap-2">
                  <Maximize size={12} /> Fullscreen
                </span>
              </GlowButton>
              <GlowButton variant="ghost" onClick={resetProgress}>
                <span className="flex items-center gap-2">
                  <RotateCcw size={12} /> Reset log
                </span>
              </GlowButton>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
