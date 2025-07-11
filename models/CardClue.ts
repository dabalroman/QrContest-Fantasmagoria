import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { Uid } from '@/types/global';
import { CardTier } from '@/functions/src/types/card';

export default class CardClue extends FirebaseModel {
    uid: Uid;
    order: number;
    title: string;
    description: string;
    image: string | null;
    tier: CardTier;

    constructor (
        uid: Uid = '',
        order: number = 0,
        title: string = '',
        description: string = '',
        image: string | null = null,
        tier: CardTier = CardTier.COMMON
    ) {
        super();

        this.uid = uid;
        this.order = order;
        this.title = title;
        this.description = description;
        this.image = image;
        this.tier = tier;
    }

    protected static toFirestore (data: CardClue): object {
        throw new Error('Clues are immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): CardClue {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        return new CardClue(
            data.uid,
            data.order,
            data.title,
            data.description,
            data.image,
            data.tier
        );
    }
}


