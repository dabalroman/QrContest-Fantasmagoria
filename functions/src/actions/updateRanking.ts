import { RankingRoundUser } from '../types/rankingRound';
import { firestore } from 'firebase-admin';
import { User } from '../types/user';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import Timestamp = firestore.Timestamp;

export default async function updateRanking (
    db: firestore.Firestore,
    transaction: firestore.Transaction,
    user: User
): Promise<void> {
    const roundsSnapshot = await db.collection('ranking')
        .orderBy('from', 'asc')
        .get();

    if (roundsSnapshot.docs.length == 0) {
        logger.error('No rounds found. Seed the database.');
    }

    const roundsSnapshotsToUpdate = roundsSnapshot.docs.filter((roundSnapshot) => {
        const round = roundSnapshot.data();
        return (round.to as Timestamp).toDate()
            .getTime() >= (new Date()).getTime();
    });

    roundsSnapshotsToUpdate.forEach((snapshot) => {
        const record: RankingRoundUser = {
            username: user.username,
            score: user.score,
            amountOfCollectedCards: user.amountOfCollectedCards,
            amountOfAnsweredQuestions: user.amountOfAnsweredQuestions,
            memberOf: user.memberOf,
            lastActiveInRound: user.lastActiveInRound,
            winnerInRound: user.winnerInRound,
            updatedAt: FieldValue.serverTimestamp()
        };

        transaction.update(snapshot.ref, {
            [`users.${user.uid}`]: record
        });
    });
}
