export enum CardTier {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

export enum CardTierValue {
    COMMON = 10,
    RARE = 15,
    EPIC = 20,
    LEGENDARY = 30
}

export function isCardTier(tier: string): tier is CardTier {
    return Object.values(CardTier).includes(tier as CardTier);
}

export function isCardTierValue(value: number): value is CardTierValue {
    return Object.values(CardTierValue).includes(value as CardTierValue);
}

export function getCardTierValue(cardTier: CardTier): CardTierValue {
    switch (cardTier) {
        case CardTier.COMMON:
            return CardTierValue.COMMON;
        case CardTier.RARE:
            return CardTierValue.RARE;
        case CardTier.EPIC:
            return CardTierValue.EPIC;
        case CardTier.LEGENDARY:
            return CardTierValue.LEGENDARY;
        default:
            return CardTierValue.COMMON;
    }
}
