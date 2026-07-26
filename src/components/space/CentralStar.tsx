'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { PALETTE } from '@/constants/theme';
import { sunFragmentShader, sunVertexShader } from '@/shaders/cosmos';

const CORE_RADIUS = 16;

export function CentralStar(): JSX.Element {
  const coronaRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorCore: { value: new THREE.Color('#fff3d0') },
      uColorEdge: { value: new THREE.Color(PALETTE.gold) },
      uOpacity: { value: 0.95 },
    }),
    [],
  );

  useFrame(({ camera, clock }, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
    if (coronaRef.current) {
      coronaRef.current.quaternion.copy(camera.quaternion);
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 0.35) * 0.02;
      coronaRef.current.scale.setScalar(CORE_RADIUS * 7.4 * pulse);
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      <pointLight
        position={[0, 0, 0]}
        color="#ffd9a0"
        intensity={30000}
        distance={1400}
        decay={2}
      />
      <mesh ref={coreRef}>
        <sphereGeometry args={[CORE_RADIUS, 48, 48]} />
        <meshBasicMaterial color="#fff0c8" toneMapped={false} />
      </mesh>
      <mesh ref={coronaRef} renderOrder={-5}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
