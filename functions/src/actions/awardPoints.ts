import {User, UserCounterKey} from '../types/user';
import {logger} from 'firebase-functions';
import {DocumentReference, FieldValue, Firestore, Transaction, UpdateData} from 'firebase-admin/firestore';
import updateRanking from './updateRanking';
import updateGuild from './updateGuild';

/**
 * The single transactional writer of a score change. Increments the user doc's score (and any
 * counters), mutates the in-memory `user` in place so the fan-out helpers read post-award values,
 * then fans the change out to every open ranking round and the user's guild.
 *
 * Every point source — card collect, question answer, and future quests — must go through here so
 * the leaderboard cannot silently desync. Reads the `ranking` collection exactly once per award.
 */
export default async function awardPoints(
    db: Firestore,
    transaction: Transaction,
    userRef: DocumentReference<User>,
    user: User,
    points: number,
    counters: Partial<Record<UserCounterKey, number>> = {}
): Promise<void> {
    const counterKeys = Object.keys(counters) as UserCounterKey[];

    const counterIncrements: UpdateData<User> = {};
    counterKeys.forEach((key) => {
        counterIncrements[key] = FieldValue.increment(counters[key] as number);
    });

    // User-doc write
    transaction.update<User, User>(userRef, ({
        score: FieldValue.increment(points),
        ...counterIncrements,
        updatedAt: FieldValue.serverTimestamp()
    } as UpdateData<User>));

    // Mutate the in-memory user so the fan-out helpers read post-award values off it
    user.score += points;
    counterKeys.forEach((key) => {
        user[key] = (user[key] ?? 0) + (counters[key] as number);
    });

    // Fan out — read the ranking collection once and hand it to both helpers
    const rounds = await db.collection('ranking')
        .orderBy('from', 'asc')
        .get();

    if (rounds.docs.length == 0) {
        logger.error('No rounds found. Seed the database.');
    }

    updateRanking(rounds, transaction, user);
    await updateGuild(db, rounds, transaction, user);
}
