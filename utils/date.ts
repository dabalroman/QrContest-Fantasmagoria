export type PluralForm = 'singular' | 'plural' | 'plural2';

export function getPolishPluralForm(n: number): PluralForm {
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;

    if (lastDigit === 1 && lastTwoDigits !== 11) {
        return 'singular';
    } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
        return 'plural';
    } else {
        return 'plural2';
    }
}

export const formatTimeFromNow = (date: Date) => {
    const now = new Date();
    const minutesAgo = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (minutesAgo <= 1) {
        return 'minutę temu';
    }

    if (minutesAgo < 60) {
        const pluralType = getPolishPluralForm(minutesAgo);
        return `${minutesAgo} ${pluralType === 'plural' ? 'minuty' : 'minut'} temu`;
    }

    const hoursAgo = Math.floor(minutesAgo / 60);

    if (hoursAgo <= 1) {
        return 'godzinę temu';
    }

    if (hoursAgo < 24) {
        const pluralType = getPolishPluralForm(hoursAgo);
        return `${hoursAgo} ${pluralType === 'plural' ? 'godziny' : 'godzin'} temu`;
    }

    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo <= 1) {
        return 'wczoraj';
    }

    return `${daysAgo} dni temu`;
};

export const getHourMinutesAndWeekday = (dateFrom: Date): string => {
    let dateText = getTimeHourAndMinutes(dateFrom);

    if (dateFrom.getDate() !== (new Date()).getDate()) {
        dateText += ', ' + dateFrom.toLocaleDateString('pl-PL', { weekday: 'long' });
    }

    return dateText;
};

export const getTimeHourAndMinutes = (date: Date): string => {
    return date.toLocaleString(
        'pl-PL',
        {
            timeStyle: 'short',
            hour12: false
        }
    );
};
