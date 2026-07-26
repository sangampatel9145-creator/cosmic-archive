'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { PALETTE, SCENE } from '@/constants/theme';
import { createRandom, pointOnSphere, randomRange } from '@/utils/math';

interface CometRuntime {
  readonly curve: THREE.QuadraticBezierCurve3;
  progress: number;
  speed: number;
  delay: number;
  scale: number;
  active: boolean;
}

const UP_AXIS = new THREE.Vector3(0, 1, 0);
const HEAD_COLOR = new THREE.Color(PALETTE.highlight);
const TAIL_COLOR = new THREE.Color(PALETTE.cyan);

function respawn(comet: CometRuntime, random: () => number): void {
  const start = pointOnSphere(random, randomRange(random, 420, 760));
  const end = pointOnSphere(random, randomRange(random, 420, 760));
  const control = pointOnSphere(random, randomRange(random, 120, 420));

  comet.curve.v0.set(start[0], start[1] * 0.6, start[2]);
  comet.curve.v1.set(control[0], control[1], control[2]);
  comet.curve.v2.set(end[0], end[1] * 0.6, end[2]);
  comet.progress = 0;
  comet.speed = randomRange(random, 0.06, 0.16);
  comet.delay = randomRange(random, SCENE.cometInterval[0], SCENE.cometInterval[1]);
  comet.scale = randomRange(random, 0.7, 1.8);
  comet.active = false;
}

interface CometSystemProps {
  readonly count: number;
}

export function CometSystem({ count }: CometSystemProps): JSX.Element {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const random = useMemo(() => createRandom(31337), []);

  const comets = useMemo<CometRuntime[]>(() => {
    return Array.from({ length: count }, () => {
      const comet: CometRuntime = {
        curve: new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(),
          new THREE.Vector3(),
          new THREE.Vector3(),
        ),
        progress: 0,
        speed: 0.1,
        delay: 0,
        scale: 1,
        active: false,
      };
      respawn(comet, random);
      comet.delay = randomRange(random, 0.5, 12);
      return comet;
    });
  }, [count, random]);

  const tailDirection = useMemo(() => new THREE.Vector3(), []);
  const nextPoint = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    comets.forEach((comet, index) => {
      const group = groupRefs.current[index];
      if (!group) return;

      if (!comet.active) {
        comet.delay -= delta;
        if (comet.delay <= 0) comet.active = true;
        group.visible = false;
        return;
      }

      comet.progress += comet.speed * delta;
      if (comet.progress >= 1) {
        respawn(comet, random);
        group.visible = false;
        return;
      }

      group.visible = true;
      comet.curve.getPoint(comet.progress, nextPoint);
      group.position.copy(nextPoint);

      comet.curve.getTangent(comet.progress, tailDirection);
      group.quaternion.setFromUnitVectors(UP_AXIS, tailDirection);

      // Fade in at the start of the arc and out at the end.
      const fade =
        Math.min(comet.progress / 0.12, 1) * Math.min((1 - comet.progress) / 0.22, 1);
      group.scale.setScalar(comet.scale * (0.4 + fade * 0.9));
    });
  });

  return (
    <group>
      {comets.map((_, index) => (
        <group
          key={index}
          ref={(instance) => {
            groupRefs.current[index] = instance;
          }}
          visible={false}
        >
          <mesh>
            <sphereGeometry args={[0.9, 12, 12]} />
            <meshBasicMaterial
              color={HEAD_COLOR}
              transparent
              opacity={0.95}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, -13, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.9, 26, 10, 1, true]} />
            <meshBasicMaterial
              color={TAIL_COLOR}
              transparent
              opacity={0.22}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
