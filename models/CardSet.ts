import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { Uid } from '@/types/global';
import { CardTier } from '@/functions/src/types/card';

export type CardSetTiersRecord = {
    [CardTier.COMMON]: number;
    [CardTier.RARE]: number;
    [CardTier.EPIC]: number;
    [CardTier.LEGENDARY]: number;
    [CardTier.MYTHICAL]: number;
}

export default class CardSet extends FirebaseModel {
    uid: Uid;
    order: number;
    name: string;
    description: string;
    amountOfCards: number;
    cardTiers: CardSetTiersRecord;

    constructor (
        uid: Uid = '',
        order: number = 0,
        name: string = '',
        description: string = '',
        amountOfCards: number = 0,
        cardTiers: CardSetTiersRecord = {
            [CardTier.COMMON]: 0,
            [CardTier.RARE]: 0,
            [CardTier.EPIC]: 0,
            [CardTier.LEGENDARY]: 0,
            [CardTier.MYTHICAL]: 0,
        }
    ) {
        super();

        this.uid = uid;
        this.order = order;
        this.name = name;
        this.description = description;
        this.amountOfCards = amountOfCards;
        this.cardTiers = cardTiers;
    }

    protected static toFirestore (data: CardSet): object {
        return {
            uid: data.uid,
            order: data.order,
            name: data.name,
            description: data.description,
            amountOfCards: data.amountOfCards,
            cardTiers: data.cardTiers,
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
            data.order,
            data.name,
            data.description,
            data.amountOfCards,
            data.cardTiers
        );
    }
}


