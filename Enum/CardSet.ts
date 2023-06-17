export enum CardSet {
    MYSTIC = 'mystic',
    HORROR = 'horror',
    YOUNG = 'young',
    ANIME = 'anime',
    CREATURE = 'creature',
    SCIFI = 'sci-fi',
    VIEW = 'view',
}

export function isCardSet (cardSet: string): cardSet is CardSet {
    return Object.values(CardSet)
        .includes(cardSet as CardSet);
}

export function getCardSetFriendlyName (cardSet: CardSet): string {
    switch (cardSet) {
        case CardSet.MYSTIC:
            return 'Mistyczne';
        case CardSet.HORROR:
            return 'Horror';
        case CardSet.YOUNG:
            return 'Młode lata';
        case CardSet.ANIME:
            return 'Anime';
        case CardSet.CREATURE:
            return 'Stwory';
        case CardSet.SCIFI:
            return 'Sci-Fi';
        case CardSet.VIEW:
            return 'Widoki';
    }
}
