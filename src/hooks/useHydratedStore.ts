'use client';

import { useEffect, useState } from 'react';

import { useUniverseStore } from '@/lib/store';

/**
 * The store persists to localStorage with `skipHydration`, so it is rehydrated
 * here after mount. Overlay UI waits for this flag, which removes any chance of
 * a server/client markup mismatch.
 */
export function useHydratedStore(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isActive = true;
    const finish = (): void => {
      if (isActive) setIsHydrated(true);
    };
    Promise.resolve(useUniverseStore.persist.rehydrate()).then(finish).catch(finish);
    return () => {
      isActive = false;
    };
  }, []);

  return isHydrated;
}
