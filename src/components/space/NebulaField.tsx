'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { PALETTE, SCENE } from '@/constants/theme';
import { useUniverseStore } from '@/lib/store';
import {
  galaxyFragmentShader,
  galaxyVertexShader,
  nebulaFragmentShader,
  nebulaVertexShader,
} from '@/shaders/cosmos';
import { createRandom, damp, pointOnSphere, randomRange } from '@/utils/math';

interface CloudDefinition {
  readonly position: THREE.Vector3;
  readonly scale: number;
  readonly seed: number;
  readonly opacity: number;
  readonly colorA: THREE.Color;
  readonly colorB: THREE.Color;
  readonly rotation: number;
  readonly spin: number;
  readonly arms: number;
}

function buildClouds(
  count: number,
  seed: number,
  radiusRange: readonly [number, number],
  scaleRange: readonly [number, number],
  palette: readonly [string, string][],
): CloudDefinition[] {
  const random = createRandom(seed);
  return Array.from({ length: count }, (_, index) => {
    const [x, y, z] = pointOnSphere(
      random,
      randomRange(random, radiusRange[0], radiusRange[1]),
    );
    const pair = palette[index % palette.length];
    return {
      position: new THREE.Vector3(x, y * 0.55, z),
      scale: randomRange(random, scaleRange[0], scaleRange[1]),
      seed: random() * 100,
      opacity: randomRange(random, 0.16, 0.34),
      colorA: new THREE.Color(pair[0]),
      colorB: new THREE.Color(pair[1]),
      rotation: random() * Math.PI * 2,
      spin: randomRange(random, -0.006, 0.006),
      arms: Math.floor(randomRange(random, 2, 5)),
    };
  });
}

const NEBULA_PALETTE: readonly [string, string][] = [
  [PALETTE.nebula, PALETTE.galaxy],
  [PALETTE.accent, PALETTE.cyan],
  [PALETTE.galaxy, PALETTE.secondary],
  [PALETTE.gold, PALETTE.nebula],
];

const GALAXY_PALETTE: readonly [string, string][] = [
  [PALETTE.cyan, PALETTE.accent],
  [PALETTE.gold, PALETTE.nebula],
  [PALETTE.highlight, PALETTE.galaxy],
];

interface BillboardCloudProps {
  readonly definition: CloudDefinition;
  readonly variant: 'nebula' | 'galaxy';
  readonly spectrum: number;
}

function BillboardCloud({
  definition,
  variant,
  spectrum,
}: BillboardCloudProps): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const spectrumRef = useRef(0);
  const rotationRef = useRef(definition.rotation);

  const uniforms = useMemo(
    () => ({
      uTime: { value: definition.seed },
      uSeed: { value: definition.seed },
      uOpacity: { value: definition.opacity },
      uColorA: { value: definition.colorA.clone() },
      uColorB: { value: definition.colorB.clone() },
      uSpectrum: { value: 0 },
      uArms: { value: definition.arms },
    }),
    [definition],
  );

  useFrame(({ camera }, delta) => {
    const material = materialRef.current;
    if (material) {
      material.uniforms.uTime.value += delta;
      if (material.uniforms.uSpectrum) {
        spectrumRef.current = damp(spectrumRef.current, spectrum, 1.6, delta);
        material.uniforms.uSpectrum.value = spectrumRef.current;
      }
    }
    const mesh = meshRef.current;
    if (mesh) {
      rotationRef.current += definition.spin * delta;
      mesh.quaternion.copy(camera.quaternion);
      mesh.rotateZ(rotationRef.current);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={definition.position}
      scale={definition.scale}
      renderOrder={-10}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={variant === 'nebula' ? nebulaVertexShader : galaxyVertexShader}
        fragmentShader={
          variant === 'nebula' ? nebulaFragmentShader : galaxyFragmentShader
        }
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

interface NebulaFieldProps {
  readonly particleScale: number;
}

export function NebulaField({ particleScale }: NebulaFieldProps): JSX.Element {
  const spectrumShift = useUniverseStore((state) => state.spectrumShift);
  const nebulaCount = Math.max(2, Math.round(SCENE.nebulaLayers * particleScale + 1));
  const galaxyCount = Math.max(2, Math.round(SCENE.galaxyCount * particleScale + 1));

  const nebulae = useMemo(
    () => buildClouds(nebulaCount, 4242, [520, 1200], [420, 980], NEBULA_PALETTE),
    [nebulaCount],
  );
  const galaxies = useMemo(
    () => buildClouds(galaxyCount, 8181, [1300, 2200], [180, 460], GALAXY_PALETTE),
    [galaxyCount],
  );

  const spectrum = spectrumShift ? 1 : 0;

  return (
    <group>
      {nebulae.map((definition, index) => (
        <BillboardCloud
          key={`nebula-${index}`}
          definition={definition}
          variant="nebula"
          spectrum={spectrum}
        />
      ))}
      {galaxies.map((definition, index) => (
        <BillboardCloud
          key={`galaxy-${index}`}
          definition={definition}
          variant="galaxy"
          spectrum={spectrum}
        />
      ))}
    </group>
  );
}
