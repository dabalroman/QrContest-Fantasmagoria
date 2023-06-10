import FirebaseModel from '@/models/FirebaseModel';
import { doc, DocumentSnapshot, getDoc, setDoc, SnapshotOptions } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import { CardTier, CardTierValue, getCardTierValue, isCardTier } from '@/Enum/CardTier';
import { CardCollection, isCardCollection } from '@/Enum/CardCollection';
import kebabCase from 'lodash.kebabcase';
import { decrypt, encrypt } from '@/utils/cipher';

export default class Card extends FirebaseModel {
    path = FireDoc.CARD;

    uid: string;
    name: string;
    code: string;
    value: CardTierValue;
    tier: CardTier;
    collection: CardCollection;
    image: string;
    description: string;
    withQuestion: boolean;
    isActive: boolean;
    collectedBy: string[];

    constructor (
        uid: string | null = null,
        name: string = '',
        code: string = '',
        tier: CardTier = CardTier.COMMON,
        collection: CardCollection = CardCollection.MYSTIC,
        image: string = '',
        description: string = '',
        withQuestion: boolean = false,
        isActive: boolean = false,
        collectedBy: string[] = []
    ) {
        super();

        if (!isCardTier(tier)) {
            throw new Error(`Invalid value '${tier}' for card.tier`);
        }

        if (!isCardCollection(collection)) {
            throw new Error(`Invalid value '${collection}' for card.collection`);
        }

        this.uid = uid ?? kebabCase(name);
        this.name = name;
        this.code = code;
        this.value = getCardTierValue(tier);
        this.tier = tier;
        this.collection = collection;
        this.image = image;
        this.description = description;
        this.withQuestion = withQuestion;
        this.isActive = isActive;
        this.collectedBy = collectedBy;
    }

    public static async fromUid (uid: string): Promise<Card | undefined> {
        const cardDoc = doc(firestore, FireDoc.CARD, uid)
            .withConverter(this.getConverter());
        const snapshot = await getDoc(cardDoc);
        return snapshot.data() as Card | undefined;
    }

    public async save (): Promise<void> {
        console.log(this.uid);
        try {
            await setDoc(doc(firestore, FireDoc.CARD, this.uid)
                .withConverter(Card.getConverter()), this);
            console.log('Document written');
        } catch (e) {
            console.error('Error adding document: ', e);
        }

        return;
    }

    protected static toFirestore (data: Card): object {
        return {
            uid: data.uid,
            name: data.name,
            code: data.code,
            value: data.value,
            tier: data.tier,
            collection: data.collection,
            image: data.image,
            description: data.description,
            withQuestion: data.withQuestion,
            isActive: data.isActive,
            collectedBy: data.collectedBy
        };
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): Card {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        return new Card(
            data.uid,
            data.name,
            data.code,
            data.tier,
            data.collection,
            data.image,
            data.description,
            data.withQuestion,
            data.isActive,
            data.collectedBy
        );
    }
}


