'use client';

import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { BlendFunction } from 'postprocessing';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { frameState } from '@/lib/frameState';

interface PostFXProps {
  readonly bloom: boolean;
  readonly motionBlur: boolean;
}

/**
 * Effects are mounted conditionally rather than toggled by intensity, so a
 * disabled effect costs no render pass at all.
 */
export function PostFX({ bloom, motionBlur }: PostFXProps): JSX.Element | null {
  const aberrationOffset = useMemo(() => new THREE.Vector2(0.0004, 0.0004), []);
  const offsetRef = useRef(aberrationOffset);

  useFrame(() => {
    // Chromatic separation widens during warp and near the anomaly.
    const stress = Math.max(frameState.warpProgress, frameState.distortion);
    const magnitude = 0.0004 + stress * 0.0042;
    offsetRef.current.set(magnitude, magnitude * 0.7);
  });

  if (!bloom && !motionBlur) {
    return (
      <EffectComposer multisampling={0}>
        <Vignette eskil={false} offset={0.28} darkness={0.62} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      {bloom ? (
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.22}
          luminanceSmoothing={0.32}
          mipmapBlur
          radius={0.72}
        />
      ) : null}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={aberrationOffset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.26} darkness={0.66} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.32} />
    </EffectComposer>
  );
}
