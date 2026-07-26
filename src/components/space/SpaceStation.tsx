'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

import { PALETTE } from '@/constants/theme';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';
import { damp } from '@/utils/math';

const STATION = {
  orbitRadius: 82,
  orbitSpeed: 0.021,
  phase: 3.9,
  height: 9,
  scale: 1.4,
} as const;

/**
 * The settings hub exists as a real object in the scene rather than only as a
 * button — selecting it opens the systems panel.
 */
export function SpaceStation(): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const armRef = useRef<THREE.Group>(null);
  const glowRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSettings = useUniverseStore((state) => state.toggleSettings);
  const setHovered = useUniverseStore((state) => state.setHovered);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const angle = STATION.phase + clock.getElapsedTime() * STATION.orbitSpeed;
    group.position.set(
      Math.cos(angle) * STATION.orbitRadius,
      STATION.height + Math.sin(angle * 1.3) * 2.5,
      Math.sin(angle) * STATION.orbitRadius,
    );
    group.rotation.y = -angle;

    glowRef.current = damp(glowRef.current, isHovered ? 1 : 0, 5, delta);

    // The habitation ring spins for gravity; the solar arms track the star.
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (0.35 + glowRef.current * 0.5);
    }
    if (armRef.current) {
      armRef.current.rotation.y = -angle * 0.5;
    }
  });

  const emissiveIntensity = 0.25 + glowRef.current * 1.4;

  return (
    <group ref={groupRef} scale={STATION.scale}>
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          setIsHovered(true);
          setHovered('origin');
          audioEngine.play('hover');
        }}
        onPointerOut={() => {
          setIsHovered(false);
          setHovered(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          audioEngine.play('select');
          toggleSettings(true);
        }}
      >
        <cylinderGeometry args={[0.9, 0.9, 4.4, 16]} />
        <meshStandardMaterial
          color="#cfd8ea"
          metalness={0.9}
          roughness={0.24}
          emissive={PALETTE.cyan}
          emissiveIntensity={emissiveIntensity * 0.3}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <torusGeometry args={[3.6, 0.34, 10, 40]} />
        <meshStandardMaterial
          color="#9fb0cc"
          metalness={0.85}
          roughness={0.3}
          emissive={PALETTE.accent}
          emissiveIntensity={emissiveIntensity * 0.45}
        />
      </mesh>

      <group ref={armRef} raycast={() => null}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 5.4, 0, 0]}>
            <boxGeometry args={[4.2, 0.12, 1.9]} />
            <meshStandardMaterial
              color="#1f3f7a"
              metalness={0.5}
              roughness={0.4}
              emissive={PALETTE.galaxy}
              emissiveIntensity={0.22}
            />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 2.6, 0]} raycast={() => null}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshBasicMaterial color={PALETTE.gold} toneMapped={false} />
      </mesh>

      {isHovered && (
        <Html
          center
          distanceFactor={420}
          position={[0, 6.4, 0]}
          zIndexRange={[40, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="whitespace-nowrap rounded-full border border-white/15 bg-[#050816]/70 px-5 py-2.5 text-center backdrop-blur-md">
            <p className="text-eyebrow">Station · systems</p>
          </div>
        </Html>
      )}
    </group>
  );
}
