import { CardTier } from '@/Enum/CardTier';
import { CardCollection } from '@/Enum/CardCollection';
import { Timestamp } from '@firebase/firestore';

export interface RawCard {
    code: string | undefined,
    collectedAt: Timestamp
    collectedBy: string[] | undefined,
    collection: CardCollection,
    description: string,
    image: string,
    isActive: boolean | undefined,
    name: string,
    score: number | undefined,
    tier: CardTier,
    uid: string | undefined,
    value: number,
    withQuestion: boolean
}
