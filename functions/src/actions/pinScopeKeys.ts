import { Pin, PinType } from '../types/pin';

// The SINGLE source of truth for how a pin maps onto the location-achievement scopes it counts
// towards. Used by BOTH the award path (collectPinHandle, incrementing the player's counter) and the
// recompute (recomputeAchievementTargets, tallying the denominator).
//
// Sharing this helper does NOT by itself keep the two sides in step - #45 was exactly that: both
// called it, but the call sites filtered pins by type differently, so badges unlocked early. What
// keeps them honest is that neither side filters by type at all.
//
// Namespaced with `group:`/`map:` prefixes because a group uid and a mapId can collide as bare
// strings (e.g. group 'dwor' and mapId 'dwor' are the same string but different scopes).
//
// GHOST is the sole exception, and it is about the fiction, not the machinery: a ghost pin marks a
// place that is not there, parked inside some map image only because a marker needs coordinates. Its
// `map:` key is dropped so it cannot inflate that floor's location badge - it counts only towards its
// groups. Both sides of the #45 invariant still read this one helper, so they cannot drift.
export default function scopeKeys(pin: Pin): string[] {
    const groupKeys = pin.groups.map((group) => `group:${group}`);

    return pin.type === PinType.GHOST ? groupKeys : [...groupKeys, `map:${pin.mapId}`];
}
