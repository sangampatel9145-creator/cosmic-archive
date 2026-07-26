'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { PALETTE, SCENE } from '@/constants/theme';
import { useDisposableGeometry } from '@/hooks/useDisposable';
import { scaleCount } from '@/hooks/useQualityTier';
import { createRandom, randomRange } from '@/utils/math';

const FIELD_SIZE = 120;

interface CosmicDustProps {
  readonly particleScale: number;
}

/**
 * Dust is parented to the camera and wrapped inside a cube, so the camera can
 * travel any distance and still be surrounded by nearby motion cues.
 */
export function CosmicDust({ particleScale }: CosmicDustProps): JSX.Element {
  const pointsRef = useRef<THREE.Points>(null);
  const count = scaleCount(SCENE.dustCount, particleScale);
  const previousCameraPosition = useRef(new THREE.Vector3());
  const driftVector = useRef(new THREE.Vector3());

  const geometry = useMemo(() => {
    const random = createRandom(2718);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = randomRange(random, -FIELD_SIZE, FIELD_SIZE);
      positions[i * 3 + 1] = randomRange(random, -FIELD_SIZE, FIELD_SIZE);
      positions[i * 3 + 2] = randomRange(random, -FIELD_SIZE, FIELD_SIZE);
      sizes[i] = randomRange(random, 0.4, 1.4);
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(), FIELD_SIZE * 2);
    return buffer;
  }, [count]);

  useDisposableGeometry(geometry);

  useFrame(({ camera }, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const previous = previousCameraPosition.current;
    // Reuse a scratch vector — this runs every frame.
    const drift = driftVector.current.copy(camera.position).sub(previous);
    previous.copy(camera.position);

    points.position.copy(camera.position);
    points.rotation.y += delta * 0.01;

    const attribute = points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    const speed = Math.min(drift.length(), 6);

    // Wrap particles that fall outside the box so the field never depletes.
    for (let i = 0; i < array.length; i += 3) {
      array[i] -= drift.x * 0.25;
      array[i + 1] -= drift.y * 0.25;
      array[i + 2] -= drift.z * 0.25 + speed * 0.02;

      for (let axis = 0; axis < 3; axis += 1) {
        const value = array[i + axis];
        if (value > FIELD_SIZE) array[i + axis] = value - FIELD_SIZE * 2;
        else if (value < -FIELD_SIZE) array[i + axis] = value + FIELD_SIZE * 2;
      }
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color={PALETTE.cyan}
        size={0.5}
        sizeAttenuation
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
