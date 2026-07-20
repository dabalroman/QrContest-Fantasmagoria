import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export enum PhotoSubmissionStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

// A player's photo-proof submission for a `photo`-type pin (#19). Written only by submitPhotoHandle,
// mutated only by reviewPhotoHandle — both server-side. `value` and `scopeKeys` are SNAPSHOTS of the
// pin at submit time, so review is entirely self-contained: reviewPhotoHandle never re-reads the pin
// (immune to a mid-event pin edit/deletion) and the pendingScore add/subtract is always balanced.
// `username`/`pinName` are denormalized so the admin queue renders a row with no extra reads.
export type PhotoSubmission = {
    uid: string;              // submission uid (auto-id, mirrored into the doc)
    userUid: string;          // the player who submitted
    username: string;         // denormalized for the review queue
    pinUid: string;
    pinName: string;          // denormalized for the review queue
    storagePath: string;      // users/{userUid}/photos/{pinUid}
    value: number;            // snapshot of pin.value at submit — review awards exactly this
    scopeKeys: string[];      // snapshot of scopeKeys(pin) — feeds location achievements on approve
    status: PhotoSubmissionStatus;
    submittedAt: Timestamp | FieldValue;
    reviewedAt: Timestamp | FieldValue | null;
    reviewedBy: string | null;   // admin uid
};
