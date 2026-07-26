'use client';

import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useMemo } from 'react';
import * as THREE from 'three';

import { Constellations } from '@/components/effects/Constellations';
import { PlanetSystem } from '@/components/planets/PlanetSystem';
import { AsteroidBelt } from '@/components/space/AsteroidBelt';
import { CameraRig } from '@/components/space/CameraRig';
import { CentralStar } from '@/components/space/CentralStar';
import { CometSystem } from '@/components/space/CometSystem';
import { CosmicDust } from '@/components/space/CosmicDust';
import { NebulaField } from '@/components/space/NebulaField';
import { PostFX } from '@/components/space/PostFX';
import { Satellites } from '@/components/space/Satellites';
import { SpaceStation } from '@/components/space/SpaceStation';
import { SpaceWeather } from '@/components/space/SpaceWeather';
import { Starfield } from '@/components/space/Starfield';
import { WarpTunnel } from '@/components/space/WarpTunnel';
import { CAMERA, PALETTE } from '@/constants/theme';
import { useQualityTier } from '@/hooks/useQualityTier';
import { useUniverseStore } from '@/lib/store';
import type { Destination } from '@/types';

const COMET_COUNT_BY_TIER = { low: 2, medium: 3, high: 5 } as const;

export function SpaceScene(): JSX.Element {
  const profile = useQualityTier();
  const travelTo = useUniverseStore((state) => state.travelTo);

  const handleSelect = useCallback(
    (destination: Destination) => travelTo(destination.id),
    [travelTo],
  );

  const pixelRatio = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio, profile.dpr[1]);
  }, [profile.dpr]);

  return (
    <Canvas
      dpr={[profile.dpr[0], profile.dpr[1]]}
      gl={{
        antialias: profile.tier !== 'low',
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{
        fov: CAMERA.fov,
        near: CAMERA.near,
        far: CAMERA.far,
        position: [
          CAMERA.startPosition[0],
          CAMERA.startPosition[1],
          CAMERA.startPosition[2],
        ],
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color(PALETTE.primary), 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        scene.fog = new THREE.FogExp2(PALETTE.primary, 0.00042);
      }}
      fallback={null}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.24} color={PALETTE.galaxy} />
        <hemisphereLight
          intensity={0.18}
          color={PALETTE.cyan}
          groundColor={PALETTE.secondary}
        />

        <CentralStar />
        <Starfield particleScale={profile.particleScale} pixelRatio={pixelRatio} />
        <NebulaField particleScale={profile.particleScale} />
        <CosmicDust particleScale={profile.particleScale} />
        <CometSystem count={COMET_COUNT_BY_TIER[profile.tier]} />
        <AsteroidBelt particleScale={profile.particleScale} />
        <Satellites />
        <SpaceStation />
        <SpaceWeather particleScale={profile.particleScale} />
        <PlanetSystem tier={profile.tier} onSelect={handleSelect} />
        <Constellations />
        <WarpTunnel
          particleScale={profile.particleScale}
          pixelRatio={pixelRatio}
        />

        <CameraRig />
        <PostFX bloom={profile.bloom} motionBlur={profile.motionBlur} />

        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}

export default SpaceScene;
