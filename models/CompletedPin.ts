import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { isPinType, PinType } from '@/Enum/PinType';
import { Uid } from '@/types/global';

export default class CompletedPin extends FirebaseModel {
    uid: Uid;
    type: PinType;
    completedAt: Date | null;
    awardedPoints: number;
    talkName: string | null;
    rating: number | null;

    constructor (
        uid: Uid = '',
        type: PinType = PinType.CODE,
        completedAt: Date | null = null,
        awardedPoints: number = 0,
        talkName: string | null = null,
        rating: number | null = null,
    ) {
        super();

        if (!isPinType(type)) {
            throw new Error(`Invalid value '${type}' for completedPin.type`);
        }

        this.uid = uid;
        this.type = type;
        this.completedAt = completedAt;
        this.awardedPoints = awardedPoints;
        this.talkName = talkName;
        this.rating = rating;
    }

    protected static toFirestore (data: CompletedPin): object {
        throw new Error('CompletedPin is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): CompletedPin {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        return new CompletedPin(
            data.uid,
            data.type,
            data.completedAt?.toDate() ?? null,
            data.awardedPoints,
            data.talkName ?? null,
            data.rating ?? null
        );
    }
}
