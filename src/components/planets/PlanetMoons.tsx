'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

import { DISCOVERY_MAP } from '@/constants/discoveries';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';
import type { MoonConfig } from '@/types';

const TAPS_TO_WAVE = 7;

interface MoonProps {
  readonly config: MoonConfig;
  readonly phase: number;
  readonly onTap: () => void;
}

function Moon({ config, phase, onTap }: MoonProps): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const angle = phase + clock.getElapsedTime() * config.speed;
    group.position.set(
      Math.cos(angle) * config.distance,
      Math.sin(angle) * config.distance * Math.sin(config.inclination),
      Math.sin(angle) * config.distance * Math.cos(config.inclination),
    );
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          onTap();
        }}
      >
        <sphereGeometry args={[config.radius, 24, 24]} />
        <meshStandardMaterial color={config.color} roughness={0.85} metalness={0.05} />
      </mesh>
    </group>
  );
}

interface PlanetMoonsProps {
  readonly moons: readonly MoonConfig[];
}

export function PlanetMoons({ moons }: PlanetMoonsProps): JSX.Element | null {
  const tapCount = useRef(0);
  const [hasWaved, setHasWaved] = useState(false);
  const logDiscovery = useUniverseStore((state) => state.logDiscovery);

  if (moons.length === 0) return null;

  const handleTap = (): void => {
    if (hasWaved) return;
    tapCount.current += 1;
    audioEngine.play('hover');
    if (tapCount.current >= TAPS_TO_WAVE) {
      setHasWaved(true);
      audioEngine.play('discovery');
      logDiscovery(DISCOVERY_MAP['moon-tap']);
    }
  };

  return (
    <group>
      {moons.map((config, index) => (
        <Moon
          key={`${config.distance}-${index}`}
          config={config}
          phase={index * 2.1}
          onTap={handleTap}
        />
      ))}
    </group>
  );
}
