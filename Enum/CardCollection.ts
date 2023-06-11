export enum CardCollection {
    MYSTIC = 'mystic',
    HORROR = 'horror',
    YOUNG = 'young',
    ANIME = 'anime',
    CREATURE = 'creature',
    SCIFI = 'sci-fi',
    VIEW = 'view',
}

export function isCardCollection (collection: string): collection is CardCollection {
    return Object.values(CardCollection)
        .includes(collection as CardCollection);
}

export function getCardCollectionFriendlyName (collection: CardCollection): string {
    switch (collection) {
        case CardCollection.MYSTIC:
            return 'Mistyczne';
        case CardCollection.HORROR:
            return 'Horror';
        case CardCollection.YOUNG:
            return 'Młode lata';
        case CardCollection.ANIME:
            return 'Anime';
        case CardCollection.CREATURE:
            return 'Stwory';
        case CardCollection.SCIFI:
            return 'Sci-Fi';
        case CardCollection.VIEW:
            return 'Widoki';
    }
}
