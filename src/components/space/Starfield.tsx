'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { SCENE } from '@/constants/theme';
import { useDisposableGeometry } from '@/hooks/useDisposable';
import { scaleCount } from '@/hooks/useQualityTier';
import { frameState } from '@/lib/frameState';
import { starFragmentShader, starVertexShader } from '@/shaders/stars';
import { createRandom, pointOnSphere, randomRange } from '@/utils/math';

const STAR_TINTS: readonly THREE.Color[] = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#cfe0ff'),
  new THREE.Color('#9fb8ff'),
  new THREE.Color('#ffe6b0'),
  new THREE.Color('#ffc48a'),
];

interface StarLayerProps {
  readonly count: number;
  readonly radius: number;
  readonly size: number;
  readonly seed: number;
  readonly pixelRatio: number;
  readonly opacity: number;
}

function StarLayer({
  count,
  radius,
  size,
  seed,
  pixelRatio,
  opacity,
}: StarLayerProps): JSX.Element {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const random = createRandom(seed);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const [x, y, z] = pointOnSphere(random, radius * randomRange(random, 0.55, 1));
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const tint = STAR_TINTS[Math.floor(random() * STAR_TINTS.length)];
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;

      sizes[i] = randomRange(random, 0.35, 1.6);
      phases[i] = random() * Math.PI * 2;
      speeds[i] = randomRange(random, 0.18, 0.72);
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    buffer.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    buffer.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    buffer.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(speeds, 1));
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius * 1.05);
    return buffer;
  }, [count, radius, seed]);

  useDisposableGeometry(geometry);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: pixelRatio },
      uOpacity: { value: opacity },
      uWarp: { value: 0 },
    }),
    [opacity, pixelRatio, size],
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uWarp.value = frameState.warpProgress;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.0035;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface StarfieldProps {
  readonly particleScale: number;
  readonly pixelRatio: number;
}

export function Starfield({ particleScale, pixelRatio }: StarfieldProps): JSX.Element {
  return (
    <group>
      {SCENE.starLayers.map((layer, index) => (
        <StarLayer
          key={layer.radius}
          count={scaleCount(layer.count, particleScale)}
          radius={layer.radius}
          size={layer.size}
          seed={9001 + index * 137}
          pixelRatio={pixelRatio}
          opacity={1 - index * 0.18}
        />
      ))}
    </group>
  );
}
