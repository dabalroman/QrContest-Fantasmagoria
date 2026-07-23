import { StringMap } from '@/types/global';
import { entersCode, PinType } from '@/Enum/PinType';

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
    'wrong answer': 'Błędna odpowiedź!',
    'rating is invalid': 'Wybierz ocenę od 1 do 5 gwiazdek.',
    'talkName is invalid': 'Podaj nazwę prelekcji - od 10 do 255 znaków.'
};

// A code/ghost pin rejects a mistyped CODE, not a wrong riddle answer - the server throws the same
// 'wrong answer' for both, so the pin type is what tells them apart.
export function getCollectErrorMessage (error: Error, pinType?: PinType): string {
    if (error.message === 'wrong answer' && pinType && entersCode(pinType)) {
        return 'Błędny kod! Upewnij się, że wybrałeś właściwą pinezkę.';
    }

    return collectErrorsDictionary[error.message] ?? 'Błąd aplikacji, spróbuj ponownie.';
}
