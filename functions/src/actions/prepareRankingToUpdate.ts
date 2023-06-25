import { Ranking } from '../types/ranking';
import { firestore } from 'firebase-admin';
import { User } from '../types/user';
import getCurrentRound from './getCurrentRound';
import { FieldValue } from 'firebase-admin/firestore';

export default async function prepareRankingToUpdate (
    db: firestore.Firestore,
    user: User
): Promise<[rankingRef: firestore.DocumentReference, ranking: Ranking]> {
    const currentRound = await getCurrentRound(db);
    const rankingRef = db.collection('ranking')
        .doc(`ranking-${currentRound.uid}`);

    const ranking: Ranking = {
        roundUid: currentRound.uid,
        users: {
            [user.uid]: {
                username: user.username,
                score: user.score,
                amountOfCollectedCards: user.amountOfCollectedCards,
                amountOfAnsweredQuestions: user.amountOfAnsweredQuestions,
                updatedAt: FieldValue.serverTimestamp()
            }
        }
    };

    return [rankingRef, ranking];
}
