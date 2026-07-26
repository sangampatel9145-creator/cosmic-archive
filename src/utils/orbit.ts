import * as THREE from 'three';

import { DESTINATION_MAP, ORBIT_PHASE } from '@/constants/destinations';
import type { DestinationId } from '@/types';

/**
 * Planets are on live orbits, so a destination's world position is a function of
 * elapsed time. Every system that needs to point at a planet resolves it here so
 * the camera, the minimap and the scene can never disagree.
 */
export function resolveOrbitPosition(
  id: DestinationId,
  elapsed: number,
  target: THREE.Vector3,
): THREE.Vector3 {
  const destination = DESTINATION_MAP[id];
  const angle = ORBIT_PHASE[id] + elapsed * destination.orbitSpeed;
  const inclination = Math.sin(angle * 0.5) * destination.orbitRadius * 0.045;
  return target.set(
    Math.cos(angle) * destination.orbitRadius,
    inclination,
    Math.sin(angle) * destination.orbitRadius,
  );
}

export function orbitAngle(id: DestinationId, elapsed: number): number {
  return ORBIT_PHASE[id] + elapsed * DESTINATION_MAP[id].orbitSpeed;
}
