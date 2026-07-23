import { Pin, PinType } from '../types/pin';

// The SINGLE source of truth for how a pin maps onto the location-achievement scopes it counts
// towards. Used by BOTH the award path (collectPinHandle, incrementing the player's counter) and the
// recompute (recomputeAchievementTargets, tallying the denominator).
//
// Sharing this helper does NOT by itself keep the two sides in step - #45 was exactly that: both
// called it, but the call sites filtered pins by type differently, so badges unlocked early. What
// keeps them honest is that neither side filters by type at all.
//
// Namespaced with `group:`/`map:`/`type:` prefixes because a group uid, a mapId and a pin type can
// collide as bare strings (e.g. group 'dwor' and mapId 'dwor' are the same string but different scopes).
//
// `type:<pinType>` backs the per-type "collect all pins of this kind" badges (#38): pin type is
// intrinsic, so no manual grouping is needed to classify a pin. It is emitted for EVERY pin, ghost
// included - a ghost still counts towards `type:ghost` (that is how the ghosts badge is scoped).
//
// GHOST is the sole exception, and it is only about the `map:` key and the fiction, not the machinery:
// a ghost pin marks a place that is not there, parked inside some map image only because a marker needs
// coordinates. Its `map:` key alone is dropped so it cannot inflate that floor's location badge - it
// still counts towards its groups and its `type:ghost`. Both sides of the #45 invariant still read this
// one helper, so they cannot drift.
export default function scopeKeys(pin: Pin): string[] {
    const groupKeys = pin.groups.map((group) => `group:${group}`);
    const typeKey = `type:${pin.type}`;

    return pin.type === PinType.GHOST
        ? [...groupKeys, typeKey]
        : [...groupKeys, `map:${pin.mapId}`, typeKey];
}
