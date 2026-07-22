import { Pin, PublicPin } from '../types/pin';

/**
 * Load-bearing anti-leak mapping: the ONLY way a Pin may cross into client-visible shape. Maps
 * field-by-field into PublicPin - NEVER `...pin` - so `code` (the secret) and `collectedBy` (the
 * uid->finder map) can never leak. Shared by getPinsHandle (the read path) and upsertPinHandle (the
 * editor's save response), so the whitelist exists exactly once.
 */
export default function toPublicPin(pin: Pin): PublicPin {
    return {
        uid: pin.uid,
        name: pin.name,
        description: pin.description,
        clue: pin.clue,
        type: pin.type,
        groups: pin.groups,
        mapId: pin.mapId,
        coords: pin.coords,
        hintRadius: pin.hintRadius ?? null,
        value: pin.value,
        withQuestion: pin.withQuestion,
        isActive: pin.isActive,
        availableFrom: pin.availableFrom,
        availableTo: pin.availableTo
    };
}
