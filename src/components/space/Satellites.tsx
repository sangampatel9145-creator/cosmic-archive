'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { DISCOVERY_MAP } from '@/constants/discoveries';
import { PALETTE } from '@/constants/theme';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';
import { createRandom, randomRange } from '@/utils/math';

interface SatelliteRecord {
  readonly radius: number;
  readonly height: number;
  readonly speed: number;
  readonly phase: number;
  readonly tilt: number;
  readonly scale: number;
}

const SATELLITE_COUNT = 7;

function Satellite({
  record,
  onSignal,
  isDerelict,
}: {
  readonly record: SatelliteRecord;
  readonly onSignal: () => void;
  readonly isDerelict: boolean;
}): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const angle = record.phase + clock.getElapsedTime() * record.speed;
    group.position.set(
      Math.cos(angle) * record.radius,
      record.height + Math.sin(angle * 1.6) * 3,
      Math.sin(angle) * record.radius,
    );
    group.rotation.y += delta * 0.6;
    group.rotation.z = record.tilt;
  });

  const accent = isDerelict ? PALETTE.gold : PALETTE.cyan;

  return (
    <group
      ref={groupRef}
      scale={record.scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        setIsHovered(true);
        audioEngine.play('hover');
      }}
      onPointerOut={() => setIsHovered(false)}
      onClick={(event) => {
        event.stopPropagation();
        if (isDerelict) onSignal();
      }}
    >
      <mesh>
        <boxGeometry args={[0.9, 0.6, 0.6]} />
        <meshStandardMaterial
          color="#c8d4e8"
          metalness={0.85}
          roughness={0.28}
          emissive={accent}
          emissiveIntensity={isHovered ? 0.9 : 0.12}
        />
      </mesh>
      <mesh position={[1.5, 0, 0]}>
        <boxGeometry args={[1.8, 0.05, 0.7]} />
        <meshStandardMaterial color="#2a4a8a" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-1.5, 0, 0]}>
        <boxGeometry args={[1.8, 0.05, 0.7]} />
        <meshStandardMaterial color="#2a4a8a" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Satellites(): JSX.Element {
  const logDiscovery = useUniverseStore((state) => state.logDiscovery);

  const records = useMemo<SatelliteRecord[]>(() => {
    const random = createRandom(777);
    return Array.from({ length: SATELLITE_COUNT }, () => ({
      radius: randomRange(random, 70, 300),
      height: randomRange(random, -22, 26),
      speed: randomRange(random, 0.02, 0.075) * (random() > 0.5 ? 1 : -1),
      phase: random() * Math.PI * 2,
      tilt: randomRange(random, -0.6, 0.6),
      scale: randomRange(random, 0.7, 1.6),
    }));
  }, []);

  const handleSignal = (): void => {
    audioEngine.play('discovery');
    logDiscovery(DISCOVERY_MAP['satellite-signal']);
  };

  return (
    <group>
      {records.map((record, index) => (
        <Satellite
          key={index}
          record={record}
          onSignal={handleSignal}
          isDerelict={index === 2}
        />
      ))}
    </group>
  );
}
