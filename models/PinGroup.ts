import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { Uid } from '@/types/global';

// Read-only taxonomy entry — mirrors models/Achievement.ts. Feeds the admin pin editor's group
// dropdown; nothing else reads this today.
export default class PinGroup extends FirebaseModel {
    uid: Uid;
    name: string;
    icon: string | null;

    constructor (
        uid: Uid = '',
        name: string = '',
        icon: string | null = null
    ) {
        super();

        this.uid = uid;
        this.name = name;
        this.icon = icon;
    }

    protected static toFirestore (data: PinGroup): object {
        throw new Error('PinGroup is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): PinGroup {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        return new PinGroup(
            data.uid,
            data.name,
            data.icon ?? null
        );
    }
}
