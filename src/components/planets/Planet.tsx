'use client';

import { Html } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { PlanetMoons } from '@/components/planets/PlanetMoons';
import { PlanetRings } from '@/components/planets/PlanetRings';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';
import {
  atmosphereFragmentShader,
  atmosphereVertexShader,
  planetFragmentShader,
  planetVertexShader,
} from '@/shaders/planet';
import type { Destination } from '@/types';
import { damp } from '@/utils/math';
import { resolveOrbitPosition } from '@/utils/orbit';

const LABEL_DISTANCE = 640;

interface PlanetProps {
  readonly destination: Destination;
  readonly segments: number;
  readonly isFocused: boolean;
  readonly spectrum: number;
  readonly onSelect: (destination: Destination) => void;
}

export function Planet({
  destination,
  segments,
  isFocused,
  spectrum,
  onSelect,
}: PlanetProps): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  const surfaceMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const atmosphereMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const highlightRef = useRef(0);
  const spectrumRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const setHovered = useUniverseStore((state) => state.setHovered);

  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const lightDirection = useMemo(() => new THREE.Vector3(), []);
  const seed = useMemo(
    () =>
      destination.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0) %
      97,
    [destination.id],
  );

  const surfaceUniforms = useMemo(
    () => ({
      uTime: { value: seed },
      uSeed: { value: seed },
      uLowColor: { value: new THREE.Color(destination.surface[0]) },
      uMidColor: { value: new THREE.Color(destination.surface[1]) },
      uHighColor: { value: new THREE.Color(destination.surface[2]) },
      uAtmosphereColor: { value: new THREE.Color(destination.atmosphere) },
      uLightDirection: { value: new THREE.Vector3(1, 0, 0) },
      uCloudOpacity: { value: destination.cloudOpacity },
      uEmissive: { value: destination.emissive },
      uHighlight: { value: 0 },
      uSpectrum: { value: 0 },
    }),
    [destination, seed],
  );

  const atmosphereUniforms = useMemo(
    () => ({
      uTime: { value: seed },
      uColor: { value: new THREE.Color(destination.atmosphere) },
      uIntensity: { value: 0.85 },
      uLightDirection: { value: new THREE.Vector3(1, 0, 0) },
    }),
    [destination.atmosphere, seed],
  );

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    resolveOrbitPosition(destination.id, elapsed, worldPosition);
    group.position.copy(worldPosition);

    // The star sits at the origin, so light always points back towards it.
    lightDirection.copy(worldPosition).normalize().negate();

    const hoverTarget = isHovered || isFocused ? 1 : 0;
    highlightRef.current = damp(highlightRef.current, hoverTarget, 4.2, delta);
    spectrumRef.current = damp(spectrumRef.current, spectrum, 1.6, delta);

    if (surfaceRef.current) {
      surfaceRef.current.rotation.y +=
        delta * destination.rotationSpeed * (1 + highlightRef.current * 0.35);
    }

    const surfaceMaterial = surfaceMaterialRef.current;
    if (surfaceMaterial) {
      surfaceMaterial.uniforms.uTime.value += delta;
      surfaceMaterial.uniforms.uHighlight.value = highlightRef.current;
      surfaceMaterial.uniforms.uSpectrum.value = spectrumRef.current;
      surfaceMaterial.uniforms.uLightDirection.value.copy(lightDirection);
    }

    const atmosphereMaterial = atmosphereMaterialRef.current;
    if (atmosphereMaterial) {
      atmosphereMaterial.uniforms.uTime.value += delta;
      atmosphereMaterial.uniforms.uIntensity.value =
        0.7 + highlightRef.current * 0.85;
      atmosphereMaterial.uniforms.uLightDirection.value.copy(lightDirection);
    }
  });

  const handleOver = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();
    setIsHovered(true);
    setHovered(destination.id);
    audioEngine.play('hover');
  };

  const handleOut = (): void => {
    setIsHovered(false);
    setHovered(null);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    audioEngine.play('select');
    onSelect(destination);
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={surfaceRef}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[destination.radius, segments, segments]} />
        <shaderMaterial
          ref={surfaceMaterialRef}
          uniforms={surfaceUniforms}
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
        />
      </mesh>

      <mesh scale={1.14} raycast={() => null}>
        <sphereGeometry args={[destination.radius, segments, segments]} />
        <shaderMaterial
          ref={atmosphereMaterialRef}
          uniforms={atmosphereUniforms}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <PlanetRings rings={destination.rings} />
      <PlanetMoons moons={destination.moons} />

      {(isHovered || isFocused) && (
        <Html
          center
          distanceFactor={LABEL_DISTANCE}
          position={[0, destination.radius * 1.9, 0]}
          zIndexRange={[40, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="whitespace-nowrap rounded-full border border-white/15 bg-[#050816]/70 px-6 py-3 text-center backdrop-blur-md">
            <p className="text-eyebrow">{destination.designation}</p>
            <p className="mt-2 font-display text-[2.2rem] leading-none text-white">
              {destination.name}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
