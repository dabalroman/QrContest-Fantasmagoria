export enum CardTier {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary',
    MYTHICAL = 'mythical'
}

export enum CardTierValue {
    COMMON = 10,
    RARE = 15,
    EPIC = 20,
    LEGENDARY = 30,
    MYTHICAL = 50
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
        case CardTier.MYTHICAL:
            return CardTierValue.MYTHICAL;
        default:
            return CardTierValue.COMMON;
    }
}

export function getCardTierFriendlyName(cardTier: CardTier): string {
    switch (cardTier) {
        case CardTier.COMMON:
            return 'Zwykły';
        case CardTier.RARE:
            return 'Rzadki';
        case CardTier.EPIC:
            return 'Epicki';
        case CardTier.LEGENDARY:
            return 'Legendarny';
        case CardTier.MYTHICAL:
            return 'Mityczny';
    }
}
