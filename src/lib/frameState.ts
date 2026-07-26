import * as THREE from 'three';

/**
 * Values that change every frame and are read by several independent systems.
 * Kept outside React on purpose: mutating these never triggers a rerender.
 */
export interface FrameState {
  /** 0 → 1 while a warp jump is in progress. */
  warpProgress: number;
  /** 0 → 1 gravitational distortion near the anomaly. */
  distortion: number;
  /** Normalised pointer position in clip space. */
  pointer: THREE.Vector2;
  /** Current camera distance from the system centre. */
  cameraRadius: number;
  /** Seconds the camera has been settled at its destination. */
  settledFor: number;
  /** Scene clock, mirrored so DOM overlays can stay in sync with the orbits. */
  sceneElapsed: number;
}

export const frameState: FrameState = {
  warpProgress: 0,
  distortion: 0,
  pointer: new THREE.Vector2(0, 0),
  cameraRadius: 210,
  settledFor: 0,
  sceneElapsed: 0,
};

export function resetFrameState(): void {
  frameState.warpProgress = 0;
  frameState.distortion = 0;
  frameState.cameraRadius = 210;
  frameState.settledFor = 0;
  frameState.sceneElapsed = 0;
  frameState.pointer.set(0, 0);
}
