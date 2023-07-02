import { RankingRound } from '../types/rankingRound';
import { firestore } from 'firebase-admin';
import { User } from '../types/user';
import { FieldValue } from 'firebase-admin/firestore';
import Timestamp = firestore.Timestamp;
import { logger } from 'firebase-functions';

export type RankingUpdateObject = {
    ref: firestore.DocumentReference,
    round: RankingRound
};

export default async function getRankingUpdateArray (
    db: firestore.Firestore,
    user: User
): Promise<RankingUpdateObject[]> {
    const roundsSnapshot = await db.collection('ranking')
        .orderBy('from', 'asc')
        .get();

    if (roundsSnapshot.docs.length == 0) {
        logger.error('No rounds found. Seed the database.');
    }

    const roundsSnapshotsToUpdate = roundsSnapshot.docs.filter((roundSnapshot) => {
        const round = roundSnapshot.data();
        return (round.to as Timestamp).toDate().getTime() >= (new Date()).getTime();
    });

    return roundsSnapshotsToUpdate
        .map((snapshot) => {
            const round: RankingRound = snapshot.data() as RankingRound;

            round.users[user.uid] = {
                username: user.username,
                score: user.score,
                amountOfCollectedCards: user.amountOfCollectedCards,
                amountOfAnsweredQuestions: user.amountOfAnsweredQuestions,
                updatedAt: FieldValue.serverTimestamp()
            };

            return {
                ref: snapshot.ref,
                round: round
            };
        });
}
