export enum CardCollection {
    MYSTIC = 'mystic',
    HORROR = 'horror',
    YOUNG = 'young',
    ANIME = 'anime',
    CREATURE = 'creature',
    VIEW = 'view',
}

export function isCardCollection (collection: string): collection is CardCollection {
    return Object.values(CardCollection)
        .includes(collection as CardCollection);
}
