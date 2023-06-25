import { RankingRound } from '../types/rankingRound';
import { firestore } from 'firebase-admin';
import { User } from '../types/user';
import getCurrentRankingRound from './getCurrentRankingRound';
import { FieldValue } from 'firebase-admin/firestore';

export default async function prepareRankingRoundToUpdate (
    db: firestore.Firestore,
    user: User
): Promise<[rankingRoundRef: firestore.DocumentReference, rankingRound: RankingRound]> {
    const [rankingRoundRef, rankingRound] = await getCurrentRankingRound(db);

    rankingRound.users[user.uid] = {
        username: user.username,
        score: user.score,
        amountOfCollectedCards: user.amountOfCollectedCards,
        amountOfAnsweredQuestions: user.amountOfAnsweredQuestions,
        updatedAt: FieldValue.serverTimestamp()
    };

    return [rankingRoundRef, rankingRound];
}
