'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_DESTINATION, DESTINATION_MAP } from '@/constants/destinations';
import { BLACK_HOLE_DISCOVERY_THRESHOLD } from '@/constants/discoveries';
import { STORAGE_KEY } from '@/constants/theme';
import type {
  DestinationId,
  Discovery,
  DiscoveryId,
  ExperiencePhase,
  GraphicsSettings,
  QualityPreference,
  SpaceWeatherEvent,
  TextScale,
} from '@/types';

const VISIBLE_IDS: readonly DestinationId[] = (
  Object.keys(DESTINATION_MAP) as DestinationId[]
).filter((id) => !DESTINATION_MAP[id].hidden);

export const DEFAULT_SETTINGS: GraphicsSettings = {
  quality: 'auto',
  textScale: 'standard',
  bloom: true,
  motionBlur: true,
  reduceMotion: false,
  music: false,
  sfx: true,
};

interface PersistedState {
  visited: DestinationId[];
  discoveries: DiscoveryId[];
  blackHoleUnlocked: boolean;
  settings: GraphicsSettings;
  lastFocus: DestinationId | null;
  hasVisitedBefore: boolean;
}

interface TransientState {
  phase: ExperiencePhase;
  focus: DestinationId | null;
  hovered: DestinationId | null;
  isMapOpen: boolean;
  isSettingsOpen: boolean;
  isPanelOpen: boolean;
  toast: Discovery | null;
  isJournalOpen: boolean;
  weather: SpaceWeatherEvent | null;
  announcement: string;
  spectrumShift: boolean;
  distortion: number;
  webglFailed: boolean;
}

interface Actions {
  setPhase: (phase: ExperiencePhase) => void;
  beginExploration: () => void;
  travelTo: (id: DestinationId) => void;
  arriveAt: (id: DestinationId) => void;
  clearFocus: () => void;
  setHovered: (id: DestinationId | null) => void;
  toggleMap: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;
  toggleJournal: (open?: boolean) => void;
  setWeather: (event: SpaceWeatherEvent | null) => void;
  announce: (message: string) => void;
  setTextScale: (scale: TextScale) => void;
  setPanelOpen: (open: boolean) => void;
  logDiscovery: (discovery: Discovery) => void;
  dismissToast: () => void;
  updateSettings: (patch: Partial<GraphicsSettings>) => void;
  setQuality: (quality: QualityPreference) => void;
  toggleSpectrum: () => void;
  setDistortion: (value: number) => void;
  reportWebglFailure: () => void;
  resetProgress: () => void;
}

export type UniverseState = PersistedState & TransientState & Actions;

const INITIAL_TRANSIENT: TransientState = {
  phase: 'boot',
  focus: null,
  hovered: null,
  isMapOpen: false,
  isSettingsOpen: false,
  isPanelOpen: false,
  toast: null,
  isJournalOpen: false,
  weather: null,
  announcement: '',
  spectrumShift: false,
  distortion: 0,
  webglFailed: false,
};

const INITIAL_PERSISTED: PersistedState = {
  visited: [],
  discoveries: [],
  blackHoleUnlocked: false,
  settings: DEFAULT_SETTINGS,
  lastFocus: null,
  hasVisitedBefore: false,
};

function shouldUnlockAnomaly(state: PersistedState): boolean {
  if (state.blackHoleUnlocked) return true;
  const visitedAll = VISIBLE_IDS.every((id) => state.visited.includes(id));
  return visitedAll && state.discoveries.length >= BLACK_HOLE_DISCOVERY_THRESHOLD;
}

export const useUniverseStore = create<UniverseState>()(
  persist(
    (set, get) => ({
      ...INITIAL_PERSISTED,
      ...INITIAL_TRANSIENT,

      setPhase: (phase) => set({ phase }),

      beginExploration: () => {
        const { lastFocus } = get();
        set({
          phase: 'travelling',
          focus: lastFocus ?? DEFAULT_DESTINATION,
          hasVisitedBefore: true,
        });
      },

      travelTo: (id) => {
        if (get().focus === id && get().phase === 'exploring') {
          set({ isPanelOpen: true, isMapOpen: false });
          return;
        }
        set({
          phase: 'travelling',
          focus: id,
          isMapOpen: false,
          isPanelOpen: false,
          isSettingsOpen: false,
        });
      },

      arriveAt: (id) => {
        const state = get();
        const visited = state.visited.includes(id)
          ? state.visited
          : [...state.visited, id];
        const next: PersistedState = {
          ...state,
          visited,
          lastFocus: id,
        };
        set({
          phase: 'exploring',
          focus: id,
          announcement: `Arrived at ${DESTINATION_MAP[id].name}.`,
          visited,
          lastFocus: id,
          isPanelOpen: true,
          blackHoleUnlocked: shouldUnlockAnomaly(next),
        });
      },

      clearFocus: () =>
        set({
          isPanelOpen: false,
          isMapOpen: false,
          isSettingsOpen: false,
          isJournalOpen: false,
        }),

      setHovered: (id) => {
        if (get().hovered === id) return;
        set({ hovered: id });
      },

      toggleMap: (open) =>
        set((state) => ({
          isMapOpen: open ?? !state.isMapOpen,
          isSettingsOpen: false,
          isJournalOpen: false,
        })),

      toggleSettings: (open) =>
        set((state) => ({
          isSettingsOpen: open ?? !state.isSettingsOpen,
          isMapOpen: false,
          isJournalOpen: false,
        })),

      toggleJournal: (open) =>
        set((state) => ({
          isJournalOpen: open ?? !state.isJournalOpen,
          isMapOpen: false,
          isSettingsOpen: false,
        })),

      setWeather: (event) => set({ weather: event }),

      announce: (message) => set({ announcement: message }),

      setTextScale: (scale) =>
        set((state) => ({ settings: { ...state.settings, textScale: scale } })),

      setPanelOpen: (open) => set({ isPanelOpen: open }),

      logDiscovery: (discovery) => {
        const state = get();
        if (state.discoveries.includes(discovery.id)) return;
        const discoveries = [...state.discoveries, discovery.id];
        set({
          discoveries,
          toast: discovery,
          announcement: `Discovery logged: ${discovery.title}. ${discovery.description}`,
          blackHoleUnlocked: shouldUnlockAnomaly({ ...state, discoveries }),
        });
      },

      dismissToast: () => set({ toast: null }),

      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),

      setQuality: (quality) =>
        set((state) => ({ settings: { ...state.settings, quality } })),

      toggleSpectrum: () => set((state) => ({ spectrumShift: !state.spectrumShift })),

      setDistortion: (value) => set({ distortion: value }),

      reportWebglFailure: () => set({ webglFailed: true }),

      resetProgress: () =>
        set({
          ...INITIAL_PERSISTED,
          ...INITIAL_TRANSIENT,
          phase: 'title',
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedState => ({
        visited: state.visited,
        discoveries: state.discoveries,
        blackHoleUnlocked: state.blackHoleUnlocked,
        settings: state.settings,
        lastFocus: state.lastFocus,
        hasVisitedBefore: state.hasVisitedBefore,
      }),
    },
  ),
);

export function selectIsAnomalyVisible(state: UniverseState): boolean {
  return state.blackHoleUnlocked;
}
