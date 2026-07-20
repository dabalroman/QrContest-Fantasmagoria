import { Pin } from '../types/pin';

// The SINGLE source of truth for how a pin maps onto the location-achievement scopes it counts
// towards. Used by BOTH the award path (collectPinHandle, incrementing the player's counter) and the
// recompute (recomputeAchievementTargets, tallying the denominator).
//
// Sharing this helper does NOT by itself keep the two sides in step — #45 was exactly that: both
// called it, but the call sites filtered pins by type differently, so badges unlocked early. What
// keeps them honest is that neither side filters by type at all.
//
// Namespaced with `group:`/`map:` prefixes because a group uid and a mapId can collide as bare
// strings (e.g. group 'dwor' and mapId 'dwor' are the same string but different scopes).
export default function scopeKeys(pin: Pin): string[] {
    return [
        ...pin.groups.map((group) => `group:${group}`),
        `map:${pin.mapId}`
    ];
}
