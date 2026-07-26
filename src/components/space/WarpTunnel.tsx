'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { PALETTE, WARP } from '@/constants/theme';
import { useDisposableGeometry } from '@/hooks/useDisposable';
import { scaleCount } from '@/hooks/useQualityTier';
import { frameState } from '@/lib/frameState';
import { warpFragmentShader, warpVertexShader } from '@/shaders/cosmos';
import { createRandom, randomRange } from '@/utils/math';

interface WarpTunnelProps {
  readonly particleScale: number;
  readonly pixelRatio: number;
}

/**
 * The streak field is parented to the camera and only becomes visible while
 * `frameState.warpProgress` is above zero, so it costs nothing at rest.
 */
export function WarpTunnel({
  particleScale,
  pixelRatio,
}: WarpTunnelProps): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const count = scaleCount(WARP.streakCount, particleScale);

  const geometry = useMemo(() => {
    const random = createRandom(6060);
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count);
    const speeds = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = randomRange(random, 1.5, WARP.tunnelRadius);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;
      offsets[i] = random();
      speeds[i] = randomRange(random, 0.45, 1.25);
      scales[i] = randomRange(random, 0.6, 2.2);
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));
    buffer.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    buffer.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 200);
    return buffer;
  }, [count]);

  useDisposableGeometry(geometry);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uColorA: { value: new THREE.Color(PALETTE.cyan) },
      uColorB: { value: new THREE.Color(PALETTE.highlight) },
    }),
    [pixelRatio],
  );

  useFrame(({ camera }, delta) => {
    const material = materialRef.current;
    const group = groupRef.current;
    const points = pointsRef.current;
    if (!material || !group || !points) return;

    const progress = frameState.warpProgress;
    points.visible = progress > 0.001;
    if (!points.visible) return;

    material.uniforms.uTime.value += delta;
    material.uniforms.uProgress.value = progress;

    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} frustumCulled={false} visible={false}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={warpVertexShader}
          fragmentShader={warpFragmentShader}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
