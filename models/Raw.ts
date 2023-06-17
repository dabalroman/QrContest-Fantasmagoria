import { CardTier } from '@/Enum/CardTier';

export interface RawCard {
    code: string | undefined,
    collectedAt: { _seconds: number, _nanoseconds: number }
    collectedBy: string[] | undefined,
    cardSet: string,
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
