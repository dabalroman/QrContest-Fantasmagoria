export enum PinType {
    CODE = 'code',
    RIDDLE = 'riddle',
    VISIT = 'visit',
    FEEDBACK = 'feedback',
    PHOTO = 'photo',
    GHOST = 'ghost'
}

export function isPinType(type: string): type is PinType {
    return Object.values(PinType).includes(type as PinType);
}

export function getPinTypeFriendlyName(pinType: PinType): string {
    switch (pinType) {
        case PinType.CODE:
            return 'Kod';
        case PinType.RIDDLE:
            return 'Zagadka';
        case PinType.VISIT:
            return 'Odwiedziny';
        case PinType.FEEDBACK:
            return 'Opinia';
        case PinType.PHOTO:
            return 'Zdjęcie';
        case PinType.GHOST:
            return 'Duch';
    }
}
