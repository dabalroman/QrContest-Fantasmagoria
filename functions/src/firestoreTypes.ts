export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    DASHBOARD = 'dashboard'
}

export type User = {
    uid: string,
    username: string,
    score: number,
    role: UserRole
}

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

export enum CardCollection {
    MYSTIC = 'mystic',
    HORROR = 'horror',
    YOUNG = 'young',
    ANIME = 'anime',
    CREATURE = 'creature',
    SCIFI = 'sci-fi',
    VIEW = 'view',
}

export type CollectedBy = {
    [uid: string]: { username: string }
}

export type Card = {
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
    collectedBy: CollectedBy;
}
