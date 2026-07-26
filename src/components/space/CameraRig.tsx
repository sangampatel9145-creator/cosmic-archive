'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { DESTINATION_MAP } from '@/constants/destinations';
import { DISCOVERY_MAP } from '@/constants/discoveries';
import { CAMERA, WARP } from '@/constants/theme';
import { frameState } from '@/lib/frameState';
import { useUniverseStore } from '@/lib/store';
import { audioEngine } from '@/services/audio';
import { clamp, damp, easeInOutCubic } from '@/utils/math';
import { resolveOrbitPosition } from '@/utils/orbit';

const PITCH_LIMIT = 1.18;
const DRAG_SENSITIVITY = 0.0042;
const IDLE_DRIFT_DELAY = 3.2;

interface TravelState {
  active: boolean;
  elapsed: number;
  duration: number;
  from: THREE.Vector3;
  fromLook: THREE.Vector3;
}

export function CameraRig(): JSX.Element | null {
  const { camera, gl } = useThree();

  const yaw = useRef(0.7);
  const pitch = useRef(0.28);
  const targetYaw = useRef(0.7);
  const targetPitch = useRef(0.28);
  const zoom = useRef(1);
  const targetZoom = useRef(1);
  const idleTimer = useRef(0);
  const deepSpaceLogged = useRef(false);

  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const destinationPosition = useMemo(() => new THREE.Vector3(), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  const travel = useRef<TravelState>({
    active: false,
    elapsed: 0,
    duration: WARP.minDuration,
    from: new THREE.Vector3(),
    fromLook: new THREE.Vector3(),
  });

  // --- Input ---------------------------------------------------------------
  useEffect(() => {
    const element = gl.domElement;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDistance = 0;

    const onPointerDown = (event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      element.setPointerCapture(event.pointerId);
      idleTimer.current = 0;
      audioEngine.resume();
    };

    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;

      if (pointers.size === 1) {
        const deltaX = event.clientX - previous.x;
        const deltaY = event.clientY - previous.y;
        targetYaw.current -= deltaX * DRAG_SENSITIVITY;
        targetPitch.current = clamp(
          targetPitch.current + deltaY * DRAG_SENSITIVITY,
          -PITCH_LIMIT,
          PITCH_LIMIT,
        );
        idleTimer.current = 0;
      }

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 2) {
        const [a, b] = Array.from(pointers.values());
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDistance > 0) {
          const ratio = pinchDistance / distance;
          targetZoom.current = clamp(
            targetZoom.current * ratio,
            CAMERA.scrollZoomRange[0],
            CAMERA.scrollZoomRange[1],
          );
        }
        pinchDistance = distance;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchDistance = 0;
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      targetZoom.current = clamp(
        targetZoom.current * (1 + Math.sign(event.deltaY) * 0.09),
        CAMERA.scrollZoomRange[0],
        CAMERA.scrollZoomRange[1],
      );
      idleTimer.current = 0;
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);
    element.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerUp);
      element.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  // --- Travel lifecycle ----------------------------------------------------
  useEffect(() => {
    const unsubscribe = useUniverseStore.subscribe((state, previous) => {
      if (state.phase === 'travelling' && previous.phase !== 'travelling') {
        travel.current.active = true;
        travel.current.elapsed = 0;
        travel.current.duration =
          previous.phase === 'boot' || previous.phase === 'title'
            ? WARP.maxDuration
            : WARP.minDuration + Math.random() * (WARP.maxDuration - WARP.minDuration);
        travel.current.from.copy(camera.position);
        travel.current.fromLook.copy(lookTarget);
        targetZoom.current = 1;
        audioEngine.play('warp');
      }
    });
    return unsubscribe;
  }, [camera, lookTarget]);

  // --- Per-frame -----------------------------------------------------------
  useFrame(({ clock }, delta) => {
    const state = useUniverseStore.getState();
    const elapsed = clock.getElapsedTime();
    const step = Math.min(delta, 0.05);
    frameState.sceneElapsed = elapsed;

    idleTimer.current += step;
    const isIdle = idleTimer.current > IDLE_DRIFT_DELAY;
    if (isIdle && !state.isMapOpen) {
      targetYaw.current += step * CAMERA.idleDrift * 0.06;
    }

    yaw.current = damp(yaw.current, targetYaw.current, 3.4, step);
    pitch.current = damp(pitch.current, targetPitch.current, 3.4, step);
    zoom.current = damp(zoom.current, targetZoom.current, 3.0, step);

    if (state.phase === 'boot' || state.phase === 'title') {
      // Slow approach from outside the system while the title is on screen.
      const drift = elapsed * 0.03;
      desiredPosition.set(
        Math.sin(drift) * CAMERA.titlePosition[2] * 1.35,
        CAMERA.titlePosition[1] + Math.sin(elapsed * 0.14) * 4,
        Math.cos(drift) * CAMERA.titlePosition[2] * 1.35,
      );
      lookTarget.set(0, 0, 0);
      camera.position.lerp(desiredPosition, 1 - Math.exp(-0.9 * step));
      camera.lookAt(lookTarget);
      frameState.cameraRadius = camera.position.length();
      frameState.warpProgress = damp(frameState.warpProgress, 0, 3, step);
      return;
    }

    const focusId = state.focus ?? 'origin';
    const destination = DESTINATION_MAP[focusId];
    resolveOrbitPosition(focusId, elapsed, destinationPosition);

    const orbitDistance = Math.max(
      CAMERA.minDistance,
      destination.radius * CAMERA.orbitDistanceFactor * zoom.current,
    );

    desiredPosition.set(
      destinationPosition.x + Math.sin(yaw.current) * Math.cos(pitch.current) * orbitDistance,
      destinationPosition.y +
        Math.sin(pitch.current) * orbitDistance +
        destination.radius * CAMERA.orbitHeight,
      destinationPosition.z + Math.cos(yaw.current) * Math.cos(pitch.current) * orbitDistance,
    );

    if (travel.current.active) {
      travel.current.elapsed += step;
      const raw = clamp(travel.current.elapsed / travel.current.duration, 0, 1);
      const eased = easeInOutCubic(raw);

      // Warp intensity rises then falls across the jump.
      frameState.warpProgress = Math.sin(raw * Math.PI);

      camera.position.copy(travel.current.from).lerp(desiredPosition, eased);

      // Arc the path outward so the camera never cuts straight through a body.
      scratch
        .copy(desiredPosition)
        .sub(travel.current.from)
        .normalize()
        .cross(camera.up)
        .multiplyScalar(Math.sin(raw * Math.PI) * orbitDistance * 1.6);
      camera.position.add(scratch);

      lookTarget.copy(travel.current.fromLook).lerp(destinationPosition, eased);
      camera.lookAt(lookTarget);

      if (raw >= 1) {
        travel.current.active = false;
        frameState.warpProgress = 0;
        frameState.settledFor = 0;
        useUniverseStore.getState().arriveAt(focusId);
      }
      frameState.cameraRadius = camera.position.length();
      return;
    }

    frameState.warpProgress = damp(frameState.warpProgress, 0, 4, step);
    frameState.settledFor += step;

    camera.position.lerp(
      desiredPosition,
      1 - Math.exp(-CAMERA.approachDamping * step),
    );
    lookTarget.lerp(destinationPosition, 1 - Math.exp(-CAMERA.lookDamping * step));
    camera.lookAt(lookTarget);

    const radius = camera.position.length();
    frameState.cameraRadius = radius;

    // Gravitational distortion swells near the anomaly.
    const distortionTarget =
      focusId === 'blackhole' ? clamp(1 - (radius - 300) / 260, 0, 1) : 0;
    frameState.distortion = damp(frameState.distortion, distortionTarget, 1.4, step);

    if (radius > CAMERA.maxRadius && !deepSpaceLogged.current) {
      deepSpaceLogged.current = true;
      audioEngine.play('discovery');
      useUniverseStore.getState().logDiscovery(DISCOVERY_MAP['deep-space']);
    }
  });

  return null;
}
