import { firestore } from 'firebase-admin';
import { User } from '../types/user';
import { FieldValue } from 'firebase-admin/firestore';
import { https, logger } from 'firebase-functions';
import { Guild, GuildMember } from '../types/guild';
import { RankingRoundGuild } from '../types/rankingRound';
import Timestamp = firestore.Timestamp;

export default async function updateGuild (
    db: firestore.Firestore,
    transaction: firestore.Transaction,
    user: User
): Promise<void> {
    if (!user.memberOf) {
        return;
    }

    const guildRef = db.collection('guilds')
        .doc(user.memberOf);
    const guildDoc = await guildRef.get();

    if (!guildDoc.exists) {
        logger.error('getGuildUpdate', 'guild does not exist');
        throw new https.HttpsError('invalid-argument', 'guild does not exist');
    }

    const guild: Guild = guildDoc.data() as Guild;
    const memberUids = Object.keys(guild.members);

    // Recalculate all values to ensure data consistency
    const {
        score,
        amountOfAnsweredQuestions,
        amountOfCollectedCards,
        amountOfMembers
    } = memberUids.reduce(
        (acc, uid) => {
            acc.score += (uid === user.uid ? user.score : guild.members[uid].score);
            acc.amountOfAnsweredQuestions += (uid === user.uid
                    ? user.amountOfAnsweredQuestions
                    : guild.members[uid].amountOfAnsweredQuestions
            );
            acc.amountOfCollectedCards += (uid === user.uid
                    ? user.amountOfCollectedCards
                    : guild.members[uid].amountOfCollectedCards
            );
            acc.amountOfMembers += 1;
            return acc;
        },
        {
            score: 0,
            amountOfAnsweredQuestions: 0,
            amountOfCollectedCards: 0,
            amountOfMembers: 0
        }
    );

    transaction.update(guildRef, {
        [`members.${user.uid}`]: {
            username: user.username,
            score: user.score,
            amountOfCollectedCards: user.amountOfCollectedCards,
            amountOfAnsweredQuestions: user.amountOfAnsweredQuestions,
            joinedAt: guild.members[user.uid].joinedAt,
        } as GuildMember,
        score: score,
        amountOfAnsweredQuestions: amountOfAnsweredQuestions,
        amountOfCollectedCards: amountOfCollectedCards,
        amountOfMembers: amountOfMembers,
        updatedAt: FieldValue.serverTimestamp()
    });

    //
    // Update rankings for guilds
    //
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
        const record: RankingRoundGuild = {
            name: guild.name,
            score: score,
            amountOfAnsweredQuestions: amountOfAnsweredQuestions,
            amountOfCollectedCards: amountOfCollectedCards,
            amountOfMembers: amountOfMembers,
            updatedAt: FieldValue.serverTimestamp()
        };

        transaction.update(snapshot.ref, {
            [`guilds.${guild.uid}`]: record
        });
    });
}
