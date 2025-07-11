import { CardTier } from './card';

export type CardClue = {
    uid: string,
    order: number,
    image: string | null,
    title: string,
    description: string,
    tier: CardTier
}
