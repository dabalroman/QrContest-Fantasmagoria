import {RankingRoundUser, RankingRoundUsers} from '../types/rankingRound';
import {User} from '../types/user';
import {FieldValue, QuerySnapshot, Timestamp, Transaction, UpdateData} from 'firebase-admin/firestore';

export default function updateRanking(
    rounds: QuerySnapshot,
    transaction: Transaction,
    user: User
): void {
    const roundsSnapshotsToUpdate = rounds.docs.filter((roundSnapshot) => {
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
                amountOfCollectedPins: user.amountOfCollectedPins,
                memberOf: user.memberOf,
                winnerInRound: user.winnerInRound,
                updatedAt: FieldValue.serverTimestamp()
            } as Partial<RankingRoundUser>
        }) as UpdateData<RankingRoundUsers>);
    });
}
