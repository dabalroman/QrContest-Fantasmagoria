import {RankingRoundUser, RankingRoundUsers} from '../types/rankingRound';
import {User} from '../types/user';
import {logger} from 'firebase-functions';
import {FieldValue, Firestore, Timestamp, Transaction, UpdateData} from 'firebase-admin/firestore';

export default async function updateRanking(
    db: Firestore,
    transaction: Transaction,
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
        transaction.update<RankingRoundUsers, RankingRoundUsers>(snapshot.ref, ({
            [`users.${user.uid}`]: {
                username: user.username,
                score: user.score,
                amountOfCollectedCards: user.amountOfCollectedCards,
                amountOfAnsweredQuestions: user.amountOfAnsweredQuestions,
                memberOf: user.memberOf,
                winnerInRound: user.winnerInRound,
                updatedAt: FieldValue.serverTimestamp()
            } as Partial<RankingRoundUser>
        }) as UpdateData<RankingRoundUsers>);
    });
}
