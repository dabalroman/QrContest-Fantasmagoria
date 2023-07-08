import { FieldValue } from 'firebase-admin/firestore';
import { Guild } from '../types/guild';

const guildsSeed: Guild[] = [
    {
        uid: 'gildia-otchlani',
        name: 'Gildia Otchłani',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {},
        updatedAt: FieldValue.serverTimestamp()
    },
    {
        uid: 'gildia-slonca',
        name: 'Gildia Słońca',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {},
        updatedAt: FieldValue.serverTimestamp()
    },
    {
        uid: 'gildia-pustyni',
        name: 'Gildia Pustyni',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {},
        updatedAt: FieldValue.serverTimestamp()
    },
    {
        uid: 'gildia-stali',
        name: 'Gildia Stali',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {},
        updatedAt: FieldValue.serverTimestamp()
    },
];

export default guildsSeed;
