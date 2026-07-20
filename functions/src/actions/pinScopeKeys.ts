import { Pin } from '../types/pin';

// The SINGLE source of truth for how a pin maps onto the location-achievement scopes it counts
// towards. Used by BOTH the award path (collectPinHandle, incrementing the player's counter) and the
// recompute (recomputeAchievementTargets, tallying the denominator) — using one helper for both is
// what guarantees numerator and denominator can never disagree.
//
// Namespaced with `group:`/`map:` prefixes because a group uid and a mapId can collide as bare
// strings (e.g. group 'dwor' and mapId 'dwor' are the same string but different scopes).
export default function scopeKeys(pin: Pin): string[] {
    return [
        ...pin.groups.map((group) => `group:${group}`),
        `map:${pin.mapId}`
    ];
}
