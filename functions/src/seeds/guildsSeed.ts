import { FieldValue } from 'firebase-admin/firestore';
import { Guild } from '../types/guild';

const guildsSeed: Guild[] = [
    {
        uid: 'guild-void',
        name: 'Gildia Otchłani',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {},
        updatedAt: FieldValue.serverTimestamp()
    },
    {
        uid: 'guild-water',
        name: 'Gildia Wody',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {},
        updatedAt: FieldValue.serverTimestamp()
    },
    {
        uid: 'guild-desert',
        name: 'Gildia Pustyni',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {},
        updatedAt: FieldValue.serverTimestamp()
    },
    {
        uid: 'guild-steel',
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
