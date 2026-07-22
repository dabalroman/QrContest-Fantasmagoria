import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import assertAdmin from './actions/assertAdmin';
import toPublicPin from './actions/toPublicPin';
import recomputeAchievementTargets from './actions/recomputeAchievementTargets';
import mapIds from './data/mapIds';
import { Pin, PinCollectedBy, PinCoords, PinType, PublicPin } from './types/pin';
import { PinGroup } from './types/pinGroup';

// Plain `require`, not an ES import: lodash.kebabcase's `export =` typing needs either esModuleInterop
// (functions/tsconfig.json has none) or `import x = require(...)` (illegal under the ROOT client
// tsconfig's esnext module target, which also type-checks this file via its repo-wide `**/*.ts`
// include). A runtime require sidesteps both - same package models/Pin.ts uses client-side.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const kebabCase: (value?: string) => string = require('lodash.kebabcase');

const PIN_TYPES: PinType[] = Object.values(PinType);
const CODE_PATTERN = /^[A-Z0-9]{10}$/;
// Interpolated into a URL by the client (`/pin-clues/<slug>.webp`), so keep it to a bare slug.
const CLUE_IMAGE_PATTERN = /^[a-z0-9-]+$/;
// The types the global scanner path cross-looks-up by code, so a code must be unique across them.
const GLOBALLY_LOOKED_UP_TYPES: PinType[] = [PinType.CODE, PinType.GHOST];
const normalize = (s: string): string => s.trim().toUpperCase();

// The validated, fully-authored field set. Mirrors Omit<Pin, 'uid' | 'collectedBy'>, except
// availableFrom/To travel as epoch ms (or null) rather than Timestamp - a FieldValue/Timestamp cannot
// cross the callable boundary, and the server is the one turning ms into a Timestamp.
type ValidatedPinFields = {
    name: string,
    description: string,
    clue: string,
    type: PinType,
    groups: string[],
    mapId: string,
    coords: PinCoords,
    hintRadius: number | null,
    clueImage: string | null,
    value: number,
    withQuestion: boolean,
    availableFrom: number | null,
    availableTo: number | null,
    isActive: boolean,
    code: string | null
};

// The editor's payload is always the COMPLETE authored field set, never a partial patch - the edit
// form is fully populated from the loaded doc, so there is no required-on-create-vs-patchable-on-edit
// matrix to hand-sync across the two type worlds.
export const upsertPinHandle = onCall(async (req): Promise<{ pin: PublicPin }> => {
    const data = req.data;
    const auth = req.auth;

    if (!auth || !auth.uid) {
        logger.error('upsertPinHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const db = getFirestore();
    await assertAdmin(db, auth.uid);

    const pinUidInput: string | null = typeof data.pinUid === 'string' ? data.pinUid : null;

    // A plain read is right here - this is an occasional admin write, not the hot award path, so the
    // 60s TTL cache loadDefinitions uses for achievements would be the wrong tool.
    const groupsSnapshot = await db.collection('pinGroups').get();
    const validGroups = new Set(groupsSnapshot.docs.map((doc) => (doc.data() as PinGroup).uid));

    const fields = validateFields(data.fields, validGroups);
    if (fields === null) {
        throw new HttpsError('invalid-argument', 'invalid pin fields');
    }

    const uid = pinUidInput ?? kebabCase(fields.name);
    const pinRef = db.collection('pins').doc(uid);

    try {
        await db.runTransaction(async (transaction) => {
            const existingDoc = await transaction.get(pinRef);

            if (!pinUidInput && existingDoc.exists) {
                logger.error('upsertPinHandle', 'pin uid already exists', uid);
                throw new HttpsError('already-exists', 'pin uid already exists');
            }

            // Mirrors collectPinHandle's own `code == X && type in [code, ghost]` pair - those are the
            // types the global scanner cross-looks-up, so a duplicate between them would make which
            // pin a printed code collects a coin toss.
            if (GLOBALLY_LOOKED_UP_TYPES.includes(fields.type) && fields.code !== null) {
                const codeSnapshot = await transaction.get(
                    db.collection('pins')
                        .where('code', '==', fields.code)
                        .where('type', 'in', GLOBALLY_LOOKED_UP_TYPES)
                );

                const collision = codeSnapshot.docs.find((doc) => doc.id !== uid);
                if (collision) {
                    logger.error('upsertPinHandle', 'code already in use', fields.code);
                    throw new HttpsError('already-exists', 'code already in use');
                }
            }

            // collectedBy is reconstructed server-side and NEVER read from the payload - an edit can
            // never wipe the finder map.
            const existing = existingDoc.exists ? existingDoc.data() as Pin : null;
            const collectedBy: PinCollectedBy = existing?.collectedBy ?? {};

            const pin: Pin = {
                uid,
                name: fields.name,
                description: fields.description,
                clue: fields.clue,
                type: fields.type,
                groups: fields.groups,
                mapId: fields.mapId,
                coords: fields.coords,
                hintRadius: fields.hintRadius,
                clueImage: fields.clueImage,
                value: fields.value,
                withQuestion: fields.withQuestion,
                availableFrom: fields.availableFrom !== null ? Timestamp.fromMillis(fields.availableFrom) : null,
                availableTo: fields.availableTo !== null ? Timestamp.fromMillis(fields.availableTo) : null,
                isActive: fields.isActive,
                code: fields.code,
                collectedBy
            };

            transaction.set(pinRef, pin);
        });

        logger.log('upsertPinHandle', `pin ${uid} saved`);

        // Covers create, edit AND deactivate - the pin set just changed shape. Never throws (see the
        // doc comment on recomputeAchievementTargets), so a target-recompute hiccup cannot turn a
        // successfully-saved pin into a reported error below.
        await recomputeAchievementTargets(db);

        const saved = (await pinRef.get()).data() as Pin;
        return { pin: toPublicPin(saved) };
    } catch (error) {
        if (error instanceof HttpsError) {
            throw error;
        }
        logger.error('upsertPinHandle', 'error while saving pin: ' + error);
        throw new HttpsError('aborted', 'error while saving pin');
    }
});

/**
 * The payload is untrusted input - treat it the way achievements' isValidDefinition treats a
 * definition doc. Every reject is logged under the stable, greppable PIN_UPSERT_INVALID prefix so a
 * silent no-op in the editor is never mysterious.
 */
function validateFields(fields: unknown, validGroups: Set<string>): ValidatedPinFields | null {
    if (!fields || typeof fields !== 'object') {
        logger.error('PIN_UPSERT_INVALID', 'fields missing');
        return null;
    }

    const f = fields as Record<string, unknown>;

    const name = typeof f.name === 'string' ? f.name.trim() : '';
    if (name.length === 0) {
        logger.error('PIN_UPSERT_INVALID', 'name is empty');
        return null;
    }

    if (typeof f.type !== 'string' || !PIN_TYPES.includes(f.type as PinType)) {
        logger.error('PIN_UPSERT_INVALID', 'type is invalid', f.type);
        return null;
    }
    const type = f.type as PinType;

    if (typeof f.mapId !== 'string' || !mapIds.includes(f.mapId)) {
        logger.error('PIN_UPSERT_INVALID', 'mapId is invalid', f.mapId);
        return null;
    }

    const groups = Array.isArray(f.groups) ? f.groups as unknown[] : null;
    if (groups === null || !groups.every((group) => typeof group === 'string' && validGroups.has(group))) {
        logger.error('PIN_UPSERT_INVALID', 'groups contains an unknown value', f.groups);
        return null;
    }

    const coords = f.coords as { x?: unknown, y?: unknown } | undefined;
    if (
        !coords
        || typeof coords.x !== 'number' || !Number.isFinite(coords.x)
        || typeof coords.y !== 'number' || !Number.isFinite(coords.y)
    ) {
        logger.error('PIN_UPSERT_INVALID', 'coords are invalid', f.coords);
        return null;
    }

    if (typeof f.value !== 'number' || !Number.isInteger(f.value) || f.value < 0) {
        logger.error('PIN_UPSERT_INVALID', 'value is invalid', f.value);
        return null;
    }

    let hintRadius: number | null = null;
    if (f.hintRadius !== null && f.hintRadius !== undefined) {
        if (typeof f.hintRadius !== 'number' || !Number.isFinite(f.hintRadius) || f.hintRadius <= 0) {
            logger.error('PIN_UPSERT_INVALID', 'hintRadius is invalid', f.hintRadius);
            return null;
        }
        hintRadius = f.hintRadius;
    }

    let clueImage: string | null = null;
    if (f.clueImage !== null && f.clueImage !== undefined && f.clueImage !== '') {
        if (typeof f.clueImage !== 'string' || !CLUE_IMAGE_PATTERN.test(f.clueImage)) {
            logger.error('PIN_UPSERT_INVALID', 'clueImage is invalid', f.clueImage);
            return null;
        }
        clueImage = f.clueImage;
    }

    const availableFrom = parseMillisOrNull(f.availableFrom);
    const availableTo = parseMillisOrNull(f.availableTo);
    if (availableFrom === undefined || availableTo === undefined) {
        logger.error('PIN_UPSERT_INVALID', 'availability window is invalid');
        return null;
    }

    // code branches by type: CODE and GHOST need the 10-char [A-Z0-9] shape (both are looked up by the
    // global scanner, where anything shorter is rejected before the query), RIDDLE needs a non-empty
    // free-text answer, everything else (VISIT/FEEDBACK/PHOTO) is forced null.
    let code: string | null = null;
    if (type === PinType.CODE || type === PinType.GHOST) {
        if (typeof f.code !== 'string' || !CODE_PATTERN.test(normalize(f.code))) {
            logger.error('PIN_UPSERT_INVALID', 'code is invalid for a code pin');
            return null;
        }
        code = normalize(f.code);
    } else if (type === PinType.RIDDLE) {
        if (typeof f.code !== 'string' || f.code.trim().length === 0) {
            logger.error('PIN_UPSERT_INVALID', 'answer is required for a riddle pin');
            return null;
        }
        code = normalize(f.code);
    }

    return {
        name,
        description: typeof f.description === 'string' ? f.description : '',
        clue: typeof f.clue === 'string' ? f.clue : '',
        type,
        groups: groups as string[],
        mapId: f.mapId as string,
        coords: { x: coords.x, y: coords.y },
        hintRadius,
        clueImage,
        value: f.value,
        withQuestion: Boolean(f.withQuestion),
        availableFrom,
        availableTo,
        isActive: Boolean(f.isActive),
        code
    };
}

/** null passes through, a finite number passes through, anything else is `undefined` (invalid). */
function parseMillisOrNull(value: unknown): number | null | undefined {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return undefined;
}
