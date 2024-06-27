/* eslint-disable max-len */
import { FieldValue } from 'firebase-admin/firestore';
import {Guild, GuildMembers} from '../types/guild';

const guildsSeed: Guild[] = [
    {
        uid: 'guild-void',
        name: 'Gildia Mroku',
        description: 'Mroczni magowie, wykorzystujący kosmiczną moc. Ich obecność to zimne ostrze, a ich Voidorb - narzędzie dominacji. Kontrola świata jest ich ostatecznym celem, a tajemnicza moc jest ich bronią.',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {} as GuildMembers,
        updatedAt: FieldValue.serverTimestamp()
    },
    {
        uid: 'guild-water',
        name: 'Gildia Wody',
        description: 'Morscy kupcy kontrolujący oceaniczne szlaki. Ich zasoby i bogactwa są legendą, a neutralność - ich tarczą. Handel to ich pasja i broń, której używają do utrzymania równowagi wobec innych gildii.',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {} as GuildMembers,
        updatedAt: FieldValue.serverTimestamp()
    },
    {
        uid: 'guild-desert',
        name: 'Gildia Pustyni',
        description: 'Bohaterowie pustyni, kultywujący moc wiatru i słońca. W pogoni za utrzymaniem swojego surowego, ale ukochanego domu, ich celem jest zniszczenie tamy Gildii Stali, która pochłania ich zasoby wodne.',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {} as GuildMembers,
        updatedAt: FieldValue.serverTimestamp()
    },
    {
        uid: 'guild-steel',
        name: 'Gildia Stali',
        description: 'Architekci postępu, trzymający w rękach klucze do przemysłowego triumfu. Pragną zdominować Erindar i jego zasoby, aby rozpalić ogniska ich stalowych miast i maszyn. Nie cofną się przed niczym.',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {} as GuildMembers,
        updatedAt: FieldValue.serverTimestamp()
    },
];

export default guildsSeed;
