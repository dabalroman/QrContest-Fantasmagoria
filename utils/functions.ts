import { HttpsCallable, httpsCallable } from '@firebase/functions';
import { functions } from '@/utils/firebase';
import { RawCard, RawQuestion } from '@/models/Raw';

export const collectCardFunction: HttpsCallable<
    { code: string },
    { card: RawCard, question: RawQuestion | null }
> = httpsCallable(functions, 'collectcard');
export const seedDatabaseFunction = httpsCallable(functions, 'seeddatabase');
