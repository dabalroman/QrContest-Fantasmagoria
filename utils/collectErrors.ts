import { StringMap } from '@/types/global';

// Keys are the HttpsError messages collectPinHandle throws. Shared by /collect and the map's pin sheet.
const collectErrorsDictionary: StringMap = {
    'pin is already collected': 'To miejsce masz już odwiedzone!',
    'pin code is invalid': 'Ten kod nie jest poprawny!',
    'code is invalid': 'Ten kod nie jest poprawny!',
    'pin uid is invalid': 'Nie znaleziono takiego miejsca.',
    'pin is not active': 'To miejsce jest chwilowo nieaktywne.',
    'pin is not available yet': 'To miejsce nie jest jeszcze dostępne.',
    'pin is no longer available': 'To miejsce nie jest już dostępne.',
    'pin type is not supported yet': 'Ten typ miejsca będzie dostępny wkrótce.',
    'wrong answer': 'Błędna odpowiedź!'
};

export function getCollectErrorMessage (error: Error): string {
    return collectErrorsDictionary[error.message] ?? 'Błąd aplikacji, spróbuj ponownie.';
}
