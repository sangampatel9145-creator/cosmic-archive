import { DESTINATIONS } from '@/constants/destinations';
import type { Destination, DestinationId, DiscoveryId } from '@/types';

export interface UnlockContext {
  readonly discoveries: readonly DiscoveryId[];
  readonly blackHoleUnlocked: boolean;
}

/**
 * A hidden body becomes reachable when the discovery that reveals it has been
 * logged. The anomaly is the exception: it has its own threshold rule held in
 * the store, so it only checks that flag.
 *
 * The scene, the minimap and the galaxy chart all call this, which keeps them
 * from ever disagreeing about what exists.
 */
export function isDestinationUnlocked(
  destination: Destination,
  context: UnlockContext,
): boolean {
  if (!destination.hidden) return true;
  if (destination.id === 'blackhole') return context.blackHoleUnlocked;
  if (!destination.unlockedBy) return false;
  return context.discoveries.includes(destination.unlockedBy);
}

export function getAvailableDestinations(
  context: UnlockContext,
): readonly Destination[] {
  return DESTINATIONS.filter((destination) =>
    isDestinationUnlocked(destination, context),
  );
}

export function getAvailableIds(context: UnlockContext): readonly DestinationId[] {
  return getAvailableDestinations(context).map((destination) => destination.id);
}
