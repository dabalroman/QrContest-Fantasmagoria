import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions, Timestamp } from '@firebase/firestore';
import { isPinType, PinType } from '@/Enum/PinType';
import { RawCollectedPin } from '@/models/Raw';
import { Uid } from '@/types/global';

export default class CollectedPin extends FirebaseModel {
    uid: Uid;
    name: string;
    description: string;
    value: number;
    type: PinType;
    collectedAt: Date | null;
    awardedPoints: number;

    constructor (
        uid: Uid = '',
        name: string = '',
        description: string = '',
        value: number = 0,
        type: PinType = PinType.CODE,
        collectedAt: Date | null = null,
        awardedPoints: number = 0,
    ) {
        super();

        if (!isPinType(type)) {
            throw new Error(`Invalid value '${type}' for collectedPin.type`);
        }

        this.uid = uid;
        this.name = name;
        this.description = description;
        this.value = value;
        this.type = type;
        this.collectedAt = collectedAt;
        this.awardedPoints = awardedPoints;
    }

    public static fromRaw (rawCollectedPin: RawCollectedPin): CollectedPin {
        return new CollectedPin(
            rawCollectedPin.uid,
            rawCollectedPin.name,
            rawCollectedPin.description,
            rawCollectedPin.value,
            rawCollectedPin.type,
            Timestamp.fromMillis(rawCollectedPin.collectedAt._seconds * 1000).toDate(),
            rawCollectedPin.awardedPoints
        );
    }

    protected static toFirestore (data: CollectedPin): object {
        throw new Error('CollectedPin is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): CollectedPin {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        return new CollectedPin(
            data.uid,
            data.name,
            data.description,
            data.value,
            data.type,
            data.collectedAt?.toDate() ?? null,
            data.awardedPoints
        );
    }
}
