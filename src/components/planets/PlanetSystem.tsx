'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

import { BlackHole } from '@/components/planets/BlackHole';
import { Planet } from '@/components/planets/Planet';
import { PALETTE } from '@/constants/theme';
import { useDisposable } from '@/hooks/useDisposable';
import { useUniverseStore } from '@/lib/store';
import { getAvailableDestinations } from '@/lib/unlock';
import type { Destination, QualityTier } from '@/types';

const SEGMENTS: Readonly<Record<QualityTier, number>> = {
  low: 32,
  medium: 56,
  high: 96,
};

function OrbitGuides({
  destinations,
}: {
  readonly destinations: readonly Destination[];
}): JSX.Element {
  const geometries = useMemo(
    () =>
      destinations.map((destination) => {
        const curve = new THREE.EllipseCurve(
          0,
          0,
          destination.orbitRadius,
          destination.orbitRadius,
          0,
          Math.PI * 2,
          false,
          0,
        );
        const points = curve.getPoints(160).map((point) => new THREE.Vector3(point.x, 0, point.y));
        return {
          id: destination.id,
          geometry: new THREE.BufferGeometry().setFromPoints(points),
        };
      }),
    [destinations],
  );

  useDisposable(
    useMemo(() => geometries.map((entry) => entry.geometry), [geometries]),
  );

  return (
    <group>
      {geometries.map(({ id, geometry }) => (
        <lineLoop key={id} geometry={geometry} raycast={() => null}>
          <lineBasicMaterial
            color={PALETTE.galaxy}
            transparent
            opacity={0.11}
            depthWrite={false}
          />
        </lineLoop>
      ))}
    </group>
  );
}

interface PlanetSystemProps {
  readonly tier: QualityTier;
  readonly onSelect: (destination: Destination) => void;
}

export function PlanetSystem({ tier, onSelect }: PlanetSystemProps): JSX.Element {
  const focus = useUniverseStore((state) => state.focus);
  const blackHoleUnlocked = useUniverseStore((state) => state.blackHoleUnlocked);
  const discoveries = useUniverseStore((state) => state.discoveries);
  const spectrumShift = useUniverseStore((state) => state.spectrumShift);
  const segments = SEGMENTS[tier];

  const available = useMemo(
    () => getAvailableDestinations({ discoveries, blackHoleUnlocked }),
    [blackHoleUnlocked, discoveries],
  );

  return (
    <group>
      <OrbitGuides destinations={available} />
      {available
        .filter((destination) => destination.id !== 'blackhole')
        .map((destination) => (
        <Planet
          key={destination.id}
          destination={destination}
          segments={segments}
          isFocused={focus === destination.id}
          spectrum={spectrumShift ? 1 : 0}
          onSelect={onSelect}
        />
      ))}
      {blackHoleUnlocked && (
        <BlackHole isFocused={focus === 'blackhole'} onSelect={onSelect} />
      )}
    </group>
  );
}
