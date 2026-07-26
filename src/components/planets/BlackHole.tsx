'use client';

import { Html } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { PALETTE } from '@/constants/theme';
import { DESTINATION_MAP } from '@/constants/destinations';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';
import { blackHoleFragmentShader, blackHoleVertexShader } from '@/shaders/cosmos';
import type { Destination } from '@/types';
import { damp } from '@/utils/math';
import { resolveOrbitPosition } from '@/utils/orbit';

const DISK_SCALE = 7.6;

interface BlackHoleProps {
  readonly isFocused: boolean;
  readonly onSelect: (destination: Destination) => void;
}

export function BlackHole({ isFocused, onSelect }: BlackHoleProps): JSX.Element {
  const destination = DESTINATION_MAP.blackhole;
  const groupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const horizonRef = useRef<THREE.Mesh>(null);
  const opacityRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const setHovered = useUniverseStore((state) => state.setHovered);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uDiskInner: { value: new THREE.Color('#fff1c9') },
      uDiskOuter: { value: new THREE.Color(PALETTE.gold) },
    }),
    [],
  );

  useFrame(({ camera, clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    resolveOrbitPosition('blackhole', clock.getElapsedTime(), worldPosition);
    group.position.copy(worldPosition);

    opacityRef.current = damp(opacityRef.current, 1, 0.9, delta);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uOpacity.value = opacityRef.current;
    }
    if (diskRef.current) {
      diskRef.current.quaternion.copy(camera.quaternion);
      const swell = isHovered || isFocused ? 1.06 : 1;
      diskRef.current.scale.setScalar(destination.radius * DISK_SCALE * swell);
    }
    if (horizonRef.current) {
      horizonRef.current.rotation.y += delta * destination.rotationSpeed;
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    audioEngine.play('warp');
    onSelect(destination);
  };

  return (
    <group ref={groupRef}>
      {/* Solid horizon so the disk always reads as being behind something. */}
      <mesh
        ref={horizonRef}
        onPointerOver={(event) => {
          event.stopPropagation();
          setIsHovered(true);
          setHovered('blackhole');
        }}
        onPointerOut={() => {
          setIsHovered(false);
          setHovered(null);
        }}
        onClick={handleClick}
      >
        <sphereGeometry args={[destination.radius, 48, 48]} />
        <meshBasicMaterial color="#01010a" toneMapped={false} />
      </mesh>

      <mesh ref={diskRef} raycast={() => null} renderOrder={2}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={blackHoleVertexShader}
          fragmentShader={blackHoleFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {(isHovered || isFocused) && (
        <Html
          center
          distanceFactor={720}
          position={[0, destination.radius * 2.4, 0]}
          zIndexRange={[40, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="whitespace-nowrap rounded-full border border-[#FFD76A]/25 bg-[#050816]/70 px-6 py-3 text-center backdrop-blur-md">
            <p className="text-eyebrow text-[#FFD76A]/80">{destination.designation}</p>
            <p className="mt-2 font-display text-[2.2rem] leading-none text-white">
              {destination.name}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
