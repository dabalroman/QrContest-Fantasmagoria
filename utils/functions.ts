import { httpsCallable } from '@firebase/functions';
import { functions } from '@/utils/firebase';

export const collectCardFunction = httpsCallable(functions, 'collectcard');
export const seedDatabaseFunction = httpsCallable(functions, 'seeddatabase');
