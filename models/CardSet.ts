import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { Uid } from '@/types/global';

export default class CardSet extends FirebaseModel {
    uid: Uid;
    name: string;
    description: string;
    amountOfCards: number;

    constructor (
        uid: Uid = '',
        name: string = '',
        description: string = '',
        amountOfCards: number = 0
    ) {
        super();

        this.uid = uid;
        this.name = name;
        this.description = description;
        this.amountOfCards = amountOfCards;
    }

    protected static toFirestore (data: CardSet): object {
        return {
            uid: data.uid,
            name: data.name,
            description: data.description,
            amountOfCards: data.amountOfCards
        };
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): CardSet {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        return new CardSet(
            data.uid,
            data.name,
            data.description,
            data.amountOfCards
        );
    }
}


