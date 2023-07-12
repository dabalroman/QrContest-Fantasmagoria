import { https, logger } from 'firebase-functions';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { User } from './types/user';
import getCurrentUser from './actions/getCurrentUser';
import updateRanking from './actions/updateRanking';
import { GuildUid } from './types/guild';
import updateGuild from './actions/updateGuild';

export default async function joinGuildHandle (
    data: any,
    context: https.CallableContext
): Promise<{ user: User }> {
    if (!context.auth || !context.auth.uid) {
        logger.error('joinGuildHandle', 'permission denied');
        throw new https.HttpsError('permission-denied', 'permission denied');
    }

    const uid: string = context.auth.uid;
    const guildToJoin: string | null = data.guild;

    if (typeof guildToJoin !== 'string' || guildToJoin.length < 3) {
        logger.error('setupAccountHandle', 'guildToJoin does not meet requirements');
        throw new https.HttpsError('invalid-argument', 'guildToJoin does not meet requirements');
    }

    // Does guild exist?
    const db = getFirestore();
    const guildRef = db.collection('guilds')
        .doc(guildToJoin);
    const guildExist = (await guildRef.get()).exists;

    if (!guildExist) {
        logger.error('joinGuildHandle', 'guild does not exist');
        throw new https.HttpsError('invalid-argument', 'guild does not exist');
    }

    const [userRef, user] = await getCurrentUser(db, uid);

    if (user.memberOf === guildToJoin) {
        logger.error('joinGuildHandle', 'already member of this guild');
        throw new https.HttpsError('invalid-argument', 'already member of this guild');
    }

    // Previous guild
    let previousGuildRef: FirebaseFirestore.DocumentReference | null = null;
    if (user.memberOf) {
        previousGuildRef = db.collection('guilds')
            .doc(user.memberOf);
        if (!(await previousGuildRef.get()).exists) {
            logger.error('joinGuildHandle', 'previous guild does not exist');
            throw new https.HttpsError('invalid-argument', 'previous guild does not exist');
        }
    }

    user.memberOf = guildToJoin as GuildUid;

    try {
        await db.runTransaction(async (transaction) => {
            transaction.update(guildRef, {
                [`members.${user.uid}`]: {
                    username: user.username,
                    score: user.score,
                    amountOfAnsweredQuestions: user.amountOfAnsweredQuestions,
                    amountOfCollectedCards: user.amountOfCollectedCards,
                    joinedAt: FieldValue.serverTimestamp()
                },
                score: FieldValue.increment(user.score),
                amountOfCollectedCards: FieldValue.increment(user.amountOfCollectedCards),
                amountOfAnsweredQuestions: FieldValue.increment(user.amountOfAnsweredQuestions),
                amountOfMembers: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp()
            });

            if (previousGuildRef) {
                transaction.update(previousGuildRef, {
                    [`members.${user.uid}`]: FieldValue.delete(),
                    score: FieldValue.increment(-user.score),
                    amountOfCollectedCards: FieldValue.increment(-user.amountOfCollectedCards),
                    amountOfAnsweredQuestions: FieldValue.increment(-user.amountOfAnsweredQuestions),
                    amountOfMembers: FieldValue.increment(-1),
                    updatedAt: FieldValue.serverTimestamp()
                });
            }

            transaction.update(userRef, {
                memberOf: guildToJoin,
                updatedAt: FieldValue.serverTimestamp()
            } as User);
        });

        await db.runTransaction(async (transaction) => {
            await updateRanking(db, transaction, user);
            await updateGuild(db, transaction, user);
        });

        logger.log('joinGuildHandle', `User ${user.username} joined ${guildToJoin}.`);
        return { user };
    } catch (error) {
        logger.error('joinGuildHandle', 'error while joining the guild: ' + error);
        throw new https.HttpsError('aborted', 'error while joining the guild');
    }
};
