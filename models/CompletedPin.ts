import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions, Timestamp } from '@firebase/firestore';
import { isPinType, PinType } from '@/Enum/PinType';
import { RawCompletedPin } from '@/models/Raw';
import { Uid } from '@/types/global';

export default class CompletedPin extends FirebaseModel {
    uid: Uid;
    name: string;
    description: string;
    value: number;
    type: PinType;
    completedAt: Date | null;
    awardedPoints: number;
    talkName: string | null;
    rating: number | null;

    constructor (
        uid: Uid = '',
        name: string = '',
        description: string = '',
        value: number = 0,
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
        this.name = name;
        this.description = description;
        this.value = value;
        this.type = type;
        this.completedAt = completedAt;
        this.awardedPoints = awardedPoints;
        this.talkName = talkName;
        this.rating = rating;
    }

    public static fromRaw (rawCompletedPin: RawCompletedPin): CompletedPin {
        return new CompletedPin(
            rawCompletedPin.uid,
            rawCompletedPin.name,
            rawCompletedPin.description,
            rawCompletedPin.value,
            rawCompletedPin.type,
            Timestamp.fromMillis(rawCompletedPin.completedAt._seconds * 1000).toDate(),
            rawCompletedPin.awardedPoints,
            rawCompletedPin.talkName ?? null,
            rawCompletedPin.rating ?? null
        );
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
            data.name,
            data.description,
            data.value,
            data.type,
            data.completedAt?.toDate() ?? null,
            data.awardedPoints,
            data.talkName ?? null,
            data.rating ?? null
        );
    }
}
