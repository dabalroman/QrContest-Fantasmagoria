import { firestore } from 'firebase-admin';
import { Round } from '../types/round';
import Timestamp = firestore.Timestamp;

export default async function getCurrentRound (db: firestore.Firestore): Promise<Round> {
    const roundsSnapshot = await db.collection('ranking')
        .doc('rounds')
        .get();

    return Object.entries(roundsSnapshot.data() ?? {})
        .map(([, round]: [string, Round]) => round)
        .filter((round: Round) =>
            (round.from as Timestamp).toDate() <= new Date() && (round.to as Timestamp).toDate() >= new Date()
        )[0] ?? ({
            uid: 'default',
            name: 'default',
            from: Timestamp.fromDate(new Date(0)),
            to: Timestamp.fromDate(new Date(0))
        } as Round
    );
}
