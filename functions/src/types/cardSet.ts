import { CardTier } from './card';

export type CardSet = {
    uid: string;
    order: number;
    name: string;
    description: string;
    amountOfCards: number;
    cardTiers: {
        [CardTier.COMMON]: number,
        [CardTier.RARE]: number,
        [CardTier.EPIC]: number,
        [CardTier.LEGENDARY]: number,
        [CardTier.MYTHICAL]: number,
    }
}
