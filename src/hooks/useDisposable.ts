'use client';

import { useEffect } from 'react';
import type * as THREE from 'three';

type Disposable = { dispose: () => void };

/**
 * Geometries and materials built in `useMemo` and passed in as props are not
 * owned by the reconciler, so React Three Fiber will not dispose them when the
 * component unmounts or when the memo is rebuilt. Registering them here frees
 * the GPU buffers at exactly the right moment.
 *
 * Pass the same value you handed to the `geometry` / `material` prop.
 */
export function useDisposable(resource: Disposable | readonly Disposable[]): void {
  useEffect(() => {
    return () => {
      if (Array.isArray(resource)) {
        (resource as readonly Disposable[]).forEach((item) => item.dispose());
      } else {
        (resource as Disposable).dispose();
      }
    };
  }, [resource]);
}

/** Convenience alias for the common single-geometry case. */
export function useDisposableGeometry(geometry: THREE.BufferGeometry): void {
  useDisposable(geometry);
}
