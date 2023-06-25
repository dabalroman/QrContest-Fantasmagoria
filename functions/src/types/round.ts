import { FieldValue } from 'firebase-admin/lib/firestore';
import { firestore } from 'firebase-admin';
import Timestamp = firestore.Timestamp;

export type Round = {
    uid: string;
    name: string;
    from: Timestamp | FieldValue | Date;
    to: Timestamp | FieldValue | Date;
}

export type RoundsCollection = {
    [uid: string]: Round
}
