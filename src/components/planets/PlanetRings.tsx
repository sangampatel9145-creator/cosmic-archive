'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { ringFragmentShader, ringVertexShader } from '@/shaders/cosmos';
import type { RingConfig } from '@/types';

interface RingProps {
  readonly config: RingConfig;
  readonly index: number;
}

function Ring({ config, index }: RingProps): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: index * 3.1 },
      uColor: { value: new THREE.Color(config.color) },
      uOpacity: { value: config.opacity },
      uSeed: { value: index * 7.7 + 1.3 },
      uInnerRatio: { value: config.innerRadius / config.outerRadius },
    }),
    [config.color, config.innerRadius, config.opacity, config.outerRadius, index],
  );

  useFrame((_, delta) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value += delta;
    if (meshRef.current) meshRef.current.rotation.z += delta * (0.02 + index * 0.008);
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[Math.PI / 2 + config.tilt, 0, 0]}
      raycast={() => null}
    >
      <ringGeometry args={[config.innerRadius, config.outerRadius, 128, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={ringVertexShader}
        fragmentShader={ringFragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

interface PlanetRingsProps {
  readonly rings: readonly RingConfig[];
}

export function PlanetRings({ rings }: PlanetRingsProps): JSX.Element | null {
  if (rings.length === 0) return null;
  return (
    <group>
      {rings.map((config, index) => (
        <Ring key={`${config.innerRadius}-${index}`} config={config} index={index} />
      ))}
    </group>
  );
}
