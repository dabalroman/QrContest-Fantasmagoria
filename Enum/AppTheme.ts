import { GuildUid } from '@/models/Guild';

export enum AppTheme {
    DESERT = 'theme-desert',
    STEEL = 'theme-steel',
    VOID = 'theme-void',
    WATER = 'theme-water',
    DEFAULT = 'theme-default'
}

export const getThemeFromGuildUuid = (guildUuid: GuildUid | null): AppTheme | null => {
    switch (guildUuid) {
        default:
            return AppTheme.DEFAULT;
        case GuildUid.desert:
            return AppTheme.DESERT;
        case GuildUid.steel:
            return AppTheme.STEEL;
        case GuildUid.void:
            return AppTheme.VOID;
        case GuildUid.water:
            return AppTheme.WATER;
    }
};
