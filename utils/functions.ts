import { HttpsCallable, httpsCallable } from '@firebase/functions';
import { functions } from '@/utils/firebase';
import { RawCard, RawQuestion } from '@/models/Raw';
import { QuestionAnswerValue } from '@/functions/src/types/question';

export const collectCardFunction: HttpsCallable<
    { code: string },
    { card: RawCard, question: RawQuestion | null }
> = httpsCallable(functions, 'collectCardHandle');

export const answerQuestionFunction: HttpsCallable<
    { uid: string, answer: string },
    { correct: boolean, correctAnswer: QuestionAnswerValue }
> = httpsCallable(functions, 'answerQuestionHandle');

export const setupAccountFunction: HttpsCallable<
    { username: string },
    {}
> = httpsCallable(functions, 'setupAccountHandle');

export const joinGuildFunction: HttpsCallable<
    { guild: string },
    {}
> = httpsCallable(functions, 'joinGuildHandle');

export const seedDatabaseFunction: HttpsCallable<
    { password: string },
    {}
> = httpsCallable(functions, 'seedDatabaseHandle');

export const updateRoundsFunction: HttpsCallable<
    {},
    { result: string }
> = httpsCallable(functions, 'updateRoundsHandle');
