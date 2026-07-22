import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { isUserRole, UserRole } from '@/Enum/UserRole';
import { GuildUid } from '@/models/Guild';

// Unlocked achievements keyed by the achievement's uid. `bonus` is what was ACTUALLY awarded at the
// time, so editing a definition later cannot rewrite history. The presentation (name/icon/target)
// is NOT copied here - it is read live from the `achievements` collection and joined by the UI.
export type UserAchievement = { grantedAt: Date, bonus: number };
export type UserAchievements = { [achievementUid: string]: UserAchievement };

export default class User extends FirebaseModel {
    uid: string;
    username: string;
    score: number;
    // Points from photo submissions awaiting admin review (#19). Display-only: shown as `+X oczekuje`
    // on the player's own ranking header, never added to score or used in leaderboard sort. Mirrors
    // functions/src/types/user.ts.
    pendingScore: number;
    amountOfCollectedCards: number;
    amountOfAnsweredQuestions: number;
    amountOfCorrectAnswers: number;
    amountOfCollectedPins: number;
    // Per-scope pin collect counter, keyed by a pinScopeKeys.ts key (`map:<mapId>` / `group:<uid>`).
    // Feeds the `pinsInScope` achievement type's progress bar - mirrors functions/src/types/user.ts.
    collectedPinsByScope: Record<string, number>;
    achievements: UserAchievements;
    memberOf: GuildUid | null;
    role: UserRole;
    winnerInRound: string | null;
    updatedAt: Date;
    lastGuildChangeAt: Date;
    isReturningPlayer: boolean;

    constructor (
        uid: string,
        username: string = '',
        score: number = 0,
        pendingScore: number = 0,
        amountOfCollectedCards: number = 0,
        amountOfAnsweredQuestions: number = 0,
        amountOfCorrectAnswers: number = 0,
        amountOfCollectedPins: number = 0,
        collectedPinsByScope: Record<string, number> = {},
        achievements: UserAchievements = {},
        memberOf: GuildUid | null = null,
        role: UserRole = UserRole.USER,
        winnerInRound: string | null = null,
        updatedAt: Date = new Date(),
        lastGuildChangeAt: Date = new Date(),
        isReturningPlayer: boolean = false,
    ) {
        super();

        this.uid = uid;
        this.username = username;
        this.score = score;
        this.pendingScore = pendingScore;
        this.amountOfCollectedCards = amountOfCollectedCards;
        this.amountOfAnsweredQuestions = amountOfAnsweredQuestions;
        this.amountOfCorrectAnswers = amountOfCorrectAnswers;
        this.amountOfCollectedPins = amountOfCollectedPins;
        this.collectedPinsByScope = collectedPinsByScope;
        this.achievements = achievements;
        this.memberOf = memberOf;
        this.role = role;
        this.winnerInRound = winnerInRound;
        this.updatedAt = updatedAt;
        this.lastGuildChangeAt = lastGuildChangeAt;
        this.isReturningPlayer = isReturningPlayer;
    }

    protected static toFirestore (data: User): object {
        throw new Error('User is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): User {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        if (!isUserRole(data.role)) {
            throw new Error(`Invalid value '${snapshot.data()?.role}' for user.role`);
        }

        // An entry written under an older shape, or a partial write, must NOT take down the whole
        // user-doc parse: useUserData subscribes to this, so a throw here bricks the app for that
        // player. Unreadable entries are skipped - the server stays the source of truth for grants.
        const achievements: UserAchievements = Object.entries(data.achievements ?? {})
            .reduce((acc: UserAchievements, [uid, entry]: [string, any]) => {
                if (typeof entry?.grantedAt?.toDate === 'function') {
                    acc[uid] = {
                        grantedAt: entry.grantedAt.toDate(),
                        bonus: typeof entry.bonus === 'number' ? entry.bonus : 0
                    };
                }

                return acc;
            }, {});

        return new User(
            data.uid,
            data.username,
            data.score,
            data.pendingScore ?? 0,
            data.amountOfCollectedCards,
            data.amountOfAnsweredQuestions,
            data.amountOfCorrectAnswers ?? 0,
            data.amountOfCollectedPins,
            data.collectedPinsByScope ?? {},
            achievements,
            data.memberOf,
            data.role,
            data.winnerInRound,
            data.updatedAt.toDate(),
            data.lastGuildChangeAt.toDate(),
            data.isReturningPlayer ?? false
        );
    }

    public isAdmin() {
        return this.role === UserRole.ADMIN;
    }

    public isDashboard() {
        return this.role === UserRole.DASHBOARD;
    }
}


