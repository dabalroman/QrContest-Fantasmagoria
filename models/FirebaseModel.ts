import { FireDoc } from '@/Enum/FireDoc';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';

export default class FirebaseModel {
    path: FireDoc = FireDoc.USERS;

    protected static toFirestore (data: FirebaseModel): object {
        throw new Error('Not available for FirebaseModel');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): FirebaseModel {
        throw new Error('Not available for FirebaseModel');
    }

    protected static getConverter (): {
        toFirestore: (data: FirebaseModel) => object,
        fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => FirebaseModel
    } {
        return {
            toFirestore: this.toFirestore,
            fromFirestore: this.fromFirestore
        };
    }
}
