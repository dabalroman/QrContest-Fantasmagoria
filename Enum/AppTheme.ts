import {CardTier} from "@/Enum/CardTier";

export enum AppTheme {
    COMMON = 'theme-common',
    RARE = 'theme-rare',
    EPIC = 'theme-epic',
    LEGENDARY = 'theme-legendary',
    MYTHICAL = 'theme-mythical'
}

export const getThemeFromCardTier = (tier: CardTier): AppTheme | null => {
    switch (tier) {
        default:
            return null;
        case CardTier.COMMON:
            return AppTheme.COMMON;
        case CardTier.RARE:
            return AppTheme.RARE;
        case CardTier.EPIC:
            return AppTheme.EPIC;
        case CardTier.LEGENDARY:
            return AppTheme.LEGENDARY;
        case CardTier.MYTHICAL:
            return AppTheme.MYTHICAL;
    }
}