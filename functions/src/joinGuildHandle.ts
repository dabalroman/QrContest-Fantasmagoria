import * as logger from 'firebase-functions/logger';
import {FieldValue, getFirestore, Timestamp, UpdateData} from 'firebase-admin/firestore';
import {User} from './types/user';
import getCurrentUser from './actions/getCurrentUser';
import updateRanking from './actions/updateRanking';
import {GuildUid} from './types/guild';
import updateGuild from './actions/updateGuild';
import {HttpsError, onCall} from "firebase-functions/https";

const TIME_BETWEEN_GUILD_CHANGES_MS = 4 * 60 * 60 * 1000;

export const joinGuildHandle = onCall(async (req): Promise<{ user: User }> => {
    const data = req.data;
    const auth = req.auth;

    if (!auth || !auth.uid) {
        logger.error('setupAccountHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }
    const uid: string = auth.uid;
    const guildToJoin: string | null = data.guild;

    if (typeof guildToJoin !== 'string' || guildToJoin.length < 3) {
        logger.error('setupAccountHandle', 'guildToJoin does not meet requirements');
        throw new HttpsError('invalid-argument', 'guildToJoin does not meet requirements');
    }

    // Does guild exist?
    const db = getFirestore();
    const guildRef = db.collection('guilds')
        .doc(guildToJoin);
    const guildExist = (await guildRef.get()).exists;

    if (!guildExist) {
        logger.error('joinGuildHandle', 'guild does not exist');
        throw new HttpsError('invalid-argument', 'guild does not exist');
    }

    const [userRef, user] = await getCurrentUser(db, uid);

    if (user.memberOf === guildToJoin) {
        logger.error('joinGuildHandle', 'already member of this guild');
        throw new HttpsError('invalid-argument', 'already member of this guild');
    }

    const timestampNow = (new Date()).getTime();
    const timestampLastChange = (user.lastGuildChangeAt as Timestamp)?.toMillis() ?? 0;

    if (timestampNow - timestampLastChange < TIME_BETWEEN_GUILD_CHANGES_MS) {
        logger.error('joinGuildHandle', 'cooldown');
        throw new HttpsError('invalid-argument', 'cooldown');
    }

    // Previous guild
    let previousGuildRef: FirebaseFirestore.DocumentReference | null = null;
    if (user.memberOf) {
        previousGuildRef = db.collection('guilds')
            .doc(user.memberOf);
        if (!(await previousGuildRef.get()).exists) {
            logger.error('joinGuildHandle', 'previous guild does not exist');
            throw new HttpsError('invalid-argument', 'previous guild does not exist');
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

            transaction.update<User, User>(userRef, {
                memberOf: guildToJoin,
                lastGuildChangeAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            } as UpdateData<User>);
        });

        await db.runTransaction(async (transaction) => {
            await updateRanking(db, transaction, user);
            await updateGuild(db, transaction, user);
        });

        logger.log('joinGuildHandle', `User ${user.username} joined ${guildToJoin}.`);
        return {user};
    } catch (error) {
        logger.error('joinGuildHandle', 'error while joining the guild: ' + error);
        throw new HttpsError('aborted', 'error while joining the guild');
    }
});
