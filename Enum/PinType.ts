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

// A ghost's prize is a printed 10-char code like a QR pin's, so it prompts and validates as a code
// even though it is found by solving something.
export function entersCode(pinType: PinType): boolean {
    return pinType === PinType.CODE || pinType === PinType.GHOST;
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
