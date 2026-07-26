'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import {
  SPACE_WEATHER,
  WEATHER_CHANCE,
  WEATHER_KINDS,
  WEATHER_ROLL_SECONDS,
} from '@/constants/lore';
import { PALETTE } from '@/constants/theme';
import { useDisposableGeometry } from '@/hooks/useDisposable';
import { scaleCount } from '@/hooks/useQualityTier';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';
import { createRandom, damp, randomRange } from '@/utils/math';

const METEOR_BASE_COUNT = 220;
const SHOWER_SPAN = 900;
const FLARE_RADIUS = 150;

interface SpaceWeatherProps {
  readonly particleScale: number;
}

/**
 * Rolls for a weather event on a fixed cadence and renders the two events that
 * have a physical presence. The others are announced through the HUD and the
 * audio engine, which keeps the frame cost of the system close to zero.
 */
export function SpaceWeather({ particleScale }: SpaceWeatherProps): JSX.Element {
  const meteorsRef = useRef<THREE.Points>(null);
  const meteorMaterialRef = useRef<THREE.PointsMaterial>(null);
  const flareRef = useRef<THREE.Mesh>(null);
  const flareMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const rollTimer = useRef(0);
  const eventTimer = useRef(0);
  const showerStrength = useRef(0);
  const flareStrength = useRef(0);

  const count = scaleCount(METEOR_BASE_COUNT, particleScale);
  const random = useMemo(() => createRandom(90210), []);

  const { geometry, velocities } = useMemo(() => {
    const seeded = createRandom(4711);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = randomRange(seeded, -SHOWER_SPAN, SHOWER_SPAN);
      positions[i * 3 + 1] = randomRange(seeded, -260, 420);
      positions[i * 3 + 2] = randomRange(seeded, -SHOWER_SPAN, SHOWER_SPAN);
      speeds[i] = randomRange(seeded, 90, 260);
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(), SHOWER_SPAN * 2);
    return { geometry: buffer, velocities: speeds };
  }, [count]);

  useDisposableGeometry(geometry);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    const store = useUniverseStore.getState();

    // --- Event scheduling -------------------------------------------------
    if (store.phase === 'exploring') {
      if (store.weather) {
        eventTimer.current -= step;
        if (eventTimer.current <= 0) {
          useUniverseStore.getState().setWeather(null);
        }
      } else {
        rollTimer.current += step;
        if (rollTimer.current >= WEATHER_ROLL_SECONDS) {
          rollTimer.current = 0;
          if (random() < WEATHER_CHANCE) {
            const kind = WEATHER_KINDS[Math.floor(random() * WEATHER_KINDS.length)];
            const event = SPACE_WEATHER[kind];
            eventTimer.current = event.durationSeconds;
            useUniverseStore.getState().setWeather(event);
            audioEngine.play('discovery');
          }
        }
      }
    }

    const kind = store.weather?.kind ?? null;
    showerStrength.current = damp(
      showerStrength.current,
      kind === 'meteor-shower' ? 1 : 0,
      1.6,
      step,
    );
    flareStrength.current = damp(
      flareStrength.current,
      kind === 'solar-flare' ? 1 : 0,
      2.2,
      step,
    );

    // --- Meteor shower ----------------------------------------------------
    const meteors = meteorsRef.current;
    if (meteors) {
      meteors.visible = showerStrength.current > 0.01;
      if (meteors.visible) {
        const attribute = meteors.geometry.getAttribute(
          'position',
        ) as THREE.BufferAttribute;
        const array = attribute.array as Float32Array;
        for (let i = 0; i < count; i += 1) {
          const index = i * 3;
          array[index + 1] -= velocities[i] * step;
          array[index] += velocities[i] * step * 0.35;
          if (array[index + 1] < -320) {
            array[index + 1] = 420;
            array[index] = randomRange(random, -SHOWER_SPAN, SHOWER_SPAN);
          }
        }
        attribute.needsUpdate = true;

        if (meteorMaterialRef.current) {
          meteorMaterialRef.current.opacity = showerStrength.current * 0.85;
        }
      }
    }

    // --- Solar flare ------------------------------------------------------
    const flare = flareRef.current;
    if (flare) {
      flare.visible = flareStrength.current > 0.01;
      if (flare.visible) {
        const pulse = 1 + Math.sin(eventTimer.current * 4.2) * 0.06;
        flare.scale.setScalar(
          (0.6 + flareStrength.current * 0.55) * FLARE_RADIUS * pulse,
        );
        flare.rotation.z += step * 0.12;
        if (flareMaterialRef.current) {
          flareMaterialRef.current.opacity = flareStrength.current * 0.32;
        }
      }
    }
  });

  return (
    <group>
      <points ref={meteorsRef} geometry={geometry} frustumCulled={false} visible={false}>
        <pointsMaterial
          ref={meteorMaterialRef}
          color={PALETTE.highlight}
          size={1.8}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh
        ref={flareRef}
        rotation={[Math.PI / 2, 0, 0]}
        visible={false}
        raycast={() => null}
      >
        <ringGeometry args={[0.32, 0.5, 64]} />
        <meshBasicMaterial
          ref={flareMaterialRef}
          color={PALETTE.gold}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
