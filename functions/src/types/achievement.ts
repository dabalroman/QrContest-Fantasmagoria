import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// The generic kinds the engine can evaluate. Each maps to exactly ONE counter accessor in
// achievements/typePredicates.ts. Adding an achievement of an existing type is a Firestore doc —
// no code, no deploy. Adding a TYPE is a code change, and this union makes that compile-enforced.
//
// `pinsInScope` counts collected pins within a `scope` (a pinScopeKeys.ts key, e.g. `map:mok-parter`
// or `group:mok`). Unlike the other two types its `target` is DERIVED — recomputeAchievementTargets
// overwrites it whenever the pin set changes — rather than human-authored.
export type AchievementType = 'points' | 'correctAnswers' | 'pinsInScope';

// Runtime companion to the union — definitions arrive as untrusted data, so the loader needs to
// check `type` at runtime. Keep in sync with AchievementType (see TYPE_COUNTERS, which is a total
// Record over the union, so a missing accessor is a compile error).
export const ACHIEVEMENT_TYPES: AchievementType[] = ['points', 'correctAnswers', 'pinsInScope'];

// A definition doc: achievements/{uid}. Editable via the Firestore console or the seed; readable by
// any authed client (nothing in here is secret). Never written by the client.
export type Achievement = {
    uid: string,
    name: string,
    description: string,
    icon: string,          // string KEY the client maps to a FontAwesome icon — never an IconDefinition
    group: string,
    type: AchievementType,
    target: number,
    bonus: number,
    // Only meaningful for type === 'pinsInScope' — a pinScopeKeys.ts scope key. See recomputeAchievementTargets.
    scope?: string
};

// What a player earned, stored at users/{uid}.achievements[achievementUid]. `bonus` records what was
// ACTUALLY awarded, so later edits to the definition cannot rewrite history.
export type UserAchievement = {
    grantedAt: Timestamp | FieldValue,
    bonus: number
};

// Surfaced in the callable response for the #30 unlock toast.
export type AchievementGrant = {
    uid: string,
    name: string,
    icon: string,
    bonus: number
};
