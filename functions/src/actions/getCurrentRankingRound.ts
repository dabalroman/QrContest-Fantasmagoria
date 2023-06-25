import { firestore } from 'firebase-admin';
import { RankingRound } from '../types/rankingRound';
import DocumentReference = firestore.DocumentReference;

/**
 * Will return round that started closest to now or fallback if none found;
 * @param db
 */
export default async function getCurrentRankingRound (db: firestore.Firestore)
    : Promise<[roundRef: DocumentReference, round: RankingRound]> {
    const roundsSnapshot = await db.collection('ranking')
        .where('from', '<=', new Date())
        .where('to', '>=', new Date())
        .orderBy('from', 'asc')
        .get();

    const rounds: RankingRound[] = roundsSnapshot.docs.map((doc) => doc.data() as RankingRound);

    if (rounds.length == 0) {
        throw new Error('No rounds found. Seed the database.');
    }

    return [(roundsSnapshot.docs.pop() as firestore.QueryDocumentSnapshot).ref, rounds.pop() as RankingRound];
}
