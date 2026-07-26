'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

import { CursorOrb } from '@/components/effects/CursorOrb';
import { GalaxyMap } from '@/components/navigation/GalaxyMap';
import { HUD } from '@/components/navigation/HUD';
import { Minimap } from '@/components/navigation/Minimap';
import { ContentPanel } from '@/components/ui/ContentPanel';
import { DiscoveryToast } from '@/components/ui/DiscoveryToast';
import { Journal } from '@/components/ui/Journal';
import { LoadingSequence } from '@/components/ui/LoadingSequence';
import { SettingsPanel } from '@/components/ui/SettingsPanel';
import { WebGLFallback } from '@/components/ui/WebGLFallback';
import { DISCOVERY_MAP, TYPED_CODES } from '@/constants/discoveries';
import { TEXT_SCALE_ROOT, TIMING } from '@/constants/theme';
import { useHydratedStore } from '@/hooks/useHydratedStore';
import { useIdle } from '@/hooks/useIdle';
import { useKeyboardShortcuts, type ShortcutMap } from '@/hooks/useKeyboardShortcuts';
import { useTypedCode } from '@/hooks/useTypedCode';
import { useUniverseStore } from '@/lib/store';
import { getAvailableIds } from '@/lib/unlock';
import { audioEngine } from '@/services/audio';

const SpaceScene = dynamic(
  () => import('@/components/space/SpaceScene').then((module) => module.SpaceScene),
  { ssr: false },
);

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}

export function ExperienceShell(): JSX.Element {
  const isHydrated = useHydratedStore();
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  const phase = useUniverseStore((state) => state.phase);
  const settings = useUniverseStore((state) => state.settings);
  const travelTo = useUniverseStore((state) => state.travelTo);
  const toggleMap = useUniverseStore((state) => state.toggleMap);
  const toggleSettings = useUniverseStore((state) => state.toggleSettings);
  const toggleSpectrum = useUniverseStore((state) => state.toggleSpectrum);
  const clearFocus = useUniverseStore((state) => state.clearFocus);
  const logDiscovery = useUniverseStore((state) => state.logDiscovery);
  const webglFailed = useUniverseStore((state) => state.webglFailed);
  const toggleJournal = useUniverseStore((state) => state.toggleJournal);
  const announcement = useUniverseStore((state) => state.announcement);
  const announce = useUniverseStore((state) => state.announce);
  const weather = useUniverseStore((state) => state.weather);

  const isLongIdle = useIdle(TIMING.longIdleMs);

  useEffect(() => {
    setHasWebGL(detectWebGL());
  }, []);

  // Text scaling is applied at the root so every rem-based size follows it.
  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SCALE_ROOT[settings.textScale];
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [settings.textScale]);

  // Weather is announced to assistive technology as well as the HUD.
  useEffect(() => {
    if (weather) announce(`${weather.title}. ${weather.description}`);
  }, [announce, weather]);

  // Audio follows the persisted preferences.
  useEffect(() => {
    audioEngine.setSfxEnabled(settings.sfx);
    audioEngine.setMusicEnabled(settings.music);
  }, [settings.music, settings.sfx]);

  useEffect(() => () => audioEngine.dispose(), []);

  // A long idle rewards patience.
  useEffect(() => {
    if (!isLongIdle || phase !== 'exploring') return;
    audioEngine.play('discovery');
    logDiscovery(DISCOVERY_MAP['idle-whale']);
  }, [isLongIdle, logDiscovery, phase]);

  /** Steps to the next or previous unlocked destination without a mouse. */
  const cycleDestination = useMemo(
    () => (direction: 1 | -1) => {
      const state = useUniverseStore.getState();
      const ids = getAvailableIds({
        discoveries: state.discoveries,
        blackHoleUnlocked: state.blackHoleUnlocked,
      });
      if (ids.length === 0) return;
      const currentIndex = state.focus ? ids.indexOf(state.focus) : -1;
      const nextIndex = (currentIndex + direction + ids.length) % ids.length;
      state.travelTo(ids[nextIndex]);
    },
    [],
  );

  const shortcuts = useMemo<ShortcutMap>(
    () => ({
      m: () => toggleMap(),
      s: () => toggleSettings(),
      j: () => toggleJournal(),
      arrowright: () => cycleDestination(1),
      arrowleft: () => cycleDestination(-1),
      escape: () => clearFocus(),
    }),
    [clearFocus, cycleDestination, toggleJournal, toggleMap, toggleSettings],
  );
  useKeyboardShortcuts(shortcuts);

  const codes = useMemo(() => Object.values(TYPED_CODES), []);
  useTypedCode(codes, (code) => {
    if (code === TYPED_CODES.galaxy) {
      toggleSpectrum();
      logDiscovery(DISCOVERY_MAP['code-galaxy']);
    } else if (code === TYPED_CODES.warp) {
      const state = useUniverseStore.getState();
      const pool = state.blackHoleUnlocked
        ? (['origin', 'observatory', 'library', 'gallery', 'comms', 'blackhole'] as const)
        : (['origin', 'observatory', 'library', 'gallery', 'comms'] as const);
      const next = pool[Math.floor(Math.random() * pool.length)];
      travelTo(next);
      logDiscovery(DISCOVERY_MAP['code-warp']);
    } else if (code === TYPED_CODES.archive) {
      logDiscovery(DISCOVERY_MAP['code-archive']);
    }
    audioEngine.play('discovery');
  });

  if (hasWebGL === false || webglFailed) {
    return <WebGLFallback />;
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">{hasWebGL ? <SpaceScene /> : null}</div>

      {/* Overlay layer. Pointer events pass through to the canvas by default. */}
      <div className="pointer-events-none absolute inset-0 z-40">
        <div className="flex h-full flex-col justify-between p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <HUD />
            {isHydrated && phase !== 'boot' && phase !== 'title' && (
              <div className="pointer-events-auto hidden lg:block">
                <Minimap />
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-4">
            <ContentPanel />
            <DiscoveryToast />
          </div>
        </div>
      </div>

      {/* Single polite live region for arrivals, discoveries and weather. */}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <GalaxyMap />
      <Journal />
      <SettingsPanel />
      <LoadingSequence />
      <CursorOrb />
    </div>
  );
}
