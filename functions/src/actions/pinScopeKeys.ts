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
// GHOST and GEOCACHING are the exceptions, and it is only about the `map:` key, not the machinery:
// a ghost marks a place that is not there, and a geocache is hidden in plain sight - both are parked
// inside a map image only because a marker needs coordinates, so neither must inflate that floor's
// location badge. Their `map:` key alone is dropped; each still counts towards its groups and its own
// `type:` scope. Both sides of the #45 invariant still read this one helper, so they cannot drift.
const MAP_SCOPED_EXCEPTIONS: PinType[] = [PinType.GHOST, PinType.GEOCACHING];

export default function scopeKeys(pin: Pin): string[] {
    const groupKeys = pin.groups.map((group) => `group:${group}`);
    const typeKey = `type:${pin.type}`;

    return MAP_SCOPED_EXCEPTIONS.includes(pin.type)
        ? [...groupKeys, typeKey]
        : [...groupKeys, `map:${pin.mapId}`, typeKey];
}
