import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions, Timestamp } from '@firebase/firestore';
import { isPinType, PinType } from '@/Enum/PinType';
import kebabCase from 'lodash.kebabcase';
import { RawPin } from '@/models/Raw';
import { Uid } from '@/types/global';

export type PinCoords = { x: number, y: number };

// The subset PinCardComponent renders. Both Pin and CollectedPin satisfy it structurally, which is what
// lets the map and the collect screen share one card component without an adapter. The description is
// rendered by the caller in a Panel below the card, the way CollectCardView does it.
export interface PinCardData {
    type: PinType;
    name: string;
    value: number;
}

export default class Pin extends FirebaseModel {
    uid: Uid;
    name: string;
    // Source-dependent: null on the getPins/fromRaw path (the callable strips the secret), the real
    // code on the fromFirestore path (#14's admin coord-picker, where admins can read `pins`).
    code: string | null;
    type: PinType;
    groups: string[];
    mapId: string;
    // Pixels from the map image top-left, y down. utils/maps.ts owns the sole swap into Leaflet space.
    coords: PinCoords;
    value: number;
    description: string;
    clue: string;
    withQuestion: boolean;
    isActive: boolean;
    availableFrom: Date | null;
    availableTo: Date | null;
    // CRS.Simple radius of the "somewhere here" area hint under a QR marker; null = precise point.
    hintRadius: number | null;

    constructor (
        uid: Uid | null = null,
        name: string = '',
        code: string | null = null,
        type: PinType = PinType.CODE,
        groups: string[] = [],
        mapId: string = '',
        coords: PinCoords = { x: 0, y: 0 },
        value: number = 0,
        description: string = '',
        clue: string = '',
        withQuestion: boolean = false,
        isActive: boolean = false,
        availableFrom: Date | null = null,
        availableTo: Date | null = null,
        hintRadius: number | null = null,
    ) {
        super();

        if (!isPinType(type)) {
            throw new Error(`Invalid value '${type}' for pin.type`);
        }

        this.uid = uid ?? kebabCase(name);
        this.name = name;
        this.code = code;
        this.type = type;
        this.groups = groups;
        this.mapId = mapId;
        this.coords = coords;
        this.value = value;
        this.description = description;
        this.clue = clue;
        this.withQuestion = withQuestion;
        this.isActive = isActive;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.hintRadius = hintRadius;
    }

    public static fromRaw (rawPin: RawPin): Pin {
        return new Pin(
            rawPin.uid,
            rawPin.name,
            null,
            rawPin.type,
            rawPin.groups,
            rawPin.mapId,
            rawPin.coords,
            rawPin.value,
            rawPin.description,
            rawPin.clue ?? '',
            rawPin.withQuestion,
            rawPin.isActive,
            rawPin.availableFrom
                ? Timestamp.fromMillis(rawPin.availableFrom._seconds * 1000).toDate()
                : null,
            rawPin.availableTo
                ? Timestamp.fromMillis(rawPin.availableTo._seconds * 1000).toDate()
                : null,
            rawPin.hintRadius ?? null
        );
    }

    protected static toFirestore (data: Pin): object {
        throw new Error('Pin is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): Pin {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        return new Pin(
            data.uid,
            data.name,
            data.code ?? null,
            data.type,
            data.groups,
            data.mapId,
            data.coords,
            data.value,
            data.description,
            data.clue,
            data.withQuestion,
            data.isActive,
            data.availableFrom?.toDate() ?? null,
            data.availableTo?.toDate() ?? null,
            data.hintRadius ?? null
        );
    }
}
