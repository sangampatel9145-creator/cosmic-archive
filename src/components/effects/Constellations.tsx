'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { DISCOVERY_MAP } from '@/constants/discoveries';
import { PALETTE, TIMING } from '@/constants/theme';
import { useDisposable } from '@/hooks/useDisposable';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';
import { createRandom, damp, randomRange } from '@/utils/math';

const NODE_COUNT = 9;
const PLANE_DISTANCE = 42;
const HOLD_SECONDS = TIMING.constellationHoldMs / 1000;

/**
 * Holding the cursor still over empty sky draws a constellation between nearby
 * stars. The figure is projected onto a plane in front of the camera so it
 * always reads clearly regardless of where the user is looking.
 */
export function Constellations(): JSX.Element {
  const { pointer } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);

  const stillFor = useRef(0);
  const opacity = useRef(0);
  const lastPointer = useRef(new THREE.Vector2());
  const hasLogged = useRef(false);
  const forward = useMemo(() => new THREE.Vector3(), []);

  const { lineGeometry, nodeGeometry } = useMemo(() => {
    const random = createRandom(1618);
    const nodes: THREE.Vector3[] = Array.from({ length: NODE_COUNT }, () => {
      return new THREE.Vector3(
        randomRange(random, -14, 14),
        randomRange(random, -9, 9),
        randomRange(random, -3, 3),
      );
    });

    // Connect nodes as a simple open path — reads as a hand-drawn figure.
    const linePoints: THREE.Vector3[] = [];
    for (let i = 0; i < nodes.length - 1; i += 1) {
      linePoints.push(nodes[i], nodes[i + 1]);
    }
    linePoints.push(nodes[2], nodes[6]);
    linePoints.push(nodes[4], nodes[8]);

    return {
      lineGeometry: new THREE.BufferGeometry().setFromPoints(linePoints),
      nodeGeometry: new THREE.BufferGeometry().setFromPoints(nodes),
    };
  }, []);

  useDisposable(useMemo(() => [lineGeometry, nodeGeometry], [lineGeometry, nodeGeometry]));

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const moved = lastPointer.current.distanceTo(pointer) > 0.001;
    lastPointer.current.copy(pointer);

    const state = useUniverseStore.getState();
    const canReveal =
      state.phase === 'exploring' && !state.isMapOpen && !state.isSettingsOpen;

    if (moved || !canReveal) {
      stillFor.current = 0;
    } else {
      stillFor.current += delta;
    }

    const target = stillFor.current > HOLD_SECONDS && canReveal ? 1 : 0;
    opacity.current = damp(opacity.current, target, 2.4, delta);

    group.visible = opacity.current > 0.01;
    if (!group.visible) return;

    // Park the figure in front of the camera, offset towards the cursor.
    camera.getWorldDirection(forward);
    group.position
      .copy(camera.position)
      .addScaledVector(forward, PLANE_DISTANCE);
    group.quaternion.copy(camera.quaternion);
    group.translateX(pointer.x * 10);
    group.translateY(pointer.y * 6);

    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = opacity.current * 0.55;
    }
    if (pointsMaterialRef.current) {
      pointsMaterialRef.current.opacity = opacity.current * 0.9;
    }

    if (target === 1 && !hasLogged.current) {
      hasLogged.current = true;
      audioEngine.play('discovery');
      useUniverseStore.getState().logDiscovery(DISCOVERY_MAP.constellation);
    }
  });

  return (
    <group ref={groupRef} visible={false} raycast={() => null}>
      <lineSegments geometry={lineGeometry} raycast={() => null}>
        <lineBasicMaterial
          ref={lineMaterialRef}
          color={PALETTE.cyan}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
      <points geometry={nodeGeometry} raycast={() => null}>
        <pointsMaterial
          ref={pointsMaterialRef}
          color={PALETTE.highlight}
          size={0.9}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
