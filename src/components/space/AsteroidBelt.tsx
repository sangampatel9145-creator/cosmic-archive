'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { DISCOVERY_MAP } from '@/constants/discoveries';
import { PALETTE, SCENE } from '@/constants/theme';
import { scaleCount } from '@/hooks/useQualityTier';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';
import { createRandom, randomRange } from '@/utils/math';

const BELT_INNER = 122;
const BELT_OUTER = 146;

interface AsteroidRecord {
  readonly angle: number;
  readonly radius: number;
  readonly height: number;
  readonly scale: number;
  readonly speed: number;
  readonly spin: THREE.Euler;
}

interface AsteroidBeltProps {
  readonly particleScale: number;
}

export function AsteroidBelt({ particleScale }: AsteroidBeltProps): JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const relicRef = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = scaleCount(SCENE.asteroidCount, particleScale);
  const logDiscovery = useUniverseStore((state) => state.logDiscovery);
  const [relicFound, setRelicFound] = useState(false);

  const asteroids = useMemo<AsteroidRecord[]>(() => {
    const random = createRandom(5150);
    return Array.from({ length: count }, () => ({
      angle: random() * Math.PI * 2,
      radius: randomRange(random, BELT_INNER, BELT_OUTER),
      height: randomRange(random, -4.5, 4.5),
      scale: randomRange(random, 0.35, 1.5),
      speed: randomRange(random, 0.004, 0.011),
      spin: new THREE.Euler(random() * 6.28, random() * 6.28, random() * 6.28),
    }));
  }, [count]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }, []);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (mesh) {
      const elapsed = clock.getElapsedTime();
      for (let i = 0; i < asteroids.length; i += 1) {
        const asteroid = asteroids[i];
        const angle = asteroid.angle + elapsed * asteroid.speed;
        dummy.position.set(
          Math.cos(angle) * asteroid.radius,
          asteroid.height,
          Math.sin(angle) * asteroid.radius,
        );
        dummy.rotation.set(
          asteroid.spin.x + elapsed * asteroid.speed * 12,
          asteroid.spin.y + elapsed * asteroid.speed * 8,
          asteroid.spin.z,
        );
        dummy.scale.setScalar(asteroid.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    const relic = relicRef.current;
    if (relic) {
      relic.rotation.y += delta * 0.5;
      relic.rotation.x += delta * 0.22;
    }
  });

  const handleRelicClick = (): void => {
    if (relicFound) return;
    setRelicFound(true);
    audioEngine.play('discovery');
    logDiscovery(DISCOVERY_MAP['asteroid-relic']);
  };

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined!, undefined!, count]}
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#6b6f80"
          roughness={0.92}
          metalness={0.08}
          flatShading
        />
      </instancedMesh>

      {/* A manufactured object hidden among the rocks. */}
      <mesh
        ref={relicRef}
        position={[BELT_OUTER * 0.72, 3.4, -BELT_OUTER * 0.68]}
        onClick={(event) => {
          event.stopPropagation();
          handleRelicClick();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          audioEngine.play('hover');
        }}
      >
        <octahedronGeometry args={[1.7, 0]} />
        <meshStandardMaterial
          color={relicFound ? PALETTE.gold : '#8fa2c4'}
          emissive={relicFound ? PALETTE.gold : PALETTE.cyan}
          emissiveIntensity={relicFound ? 1.6 : 0.35}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}
