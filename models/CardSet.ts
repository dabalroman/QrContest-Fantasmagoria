import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { FireDoc } from '@/Enum/FireDoc';

export default class CardSet extends FirebaseModel {
    path = FireDoc.CARD_SET;

    uid: string;
    name: string;
    description: string;
    amountOfCards: number;

    constructor (
        uid: string = '',
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


