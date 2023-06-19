import { FieldValue } from 'firebase-admin/firestore';
import { Question } from '../types/question';

const questionsSeed: Question[] = [
    {
        uid: 'smaug',
        question: 'W której serii książek możemy spotkać smoka o imieniu Smaug?',
        answers: {
            a: 'Hobbit',
            b: 'Eragorn',
            c: 'Gra o Tron',
            d: 'Harry Potter',
        },
        updatedAt: FieldValue.serverTimestamp(),
        correct: 'a',
        value: 5
    },
    {
        uid: 'maths',
        question: '2+2*2?',
        answers: {
            a: 'quick maths',
            b: '4',
            c: '16',
            d: '8',
        },
        updatedAt: FieldValue.serverTimestamp(),
        correct: 'a',
        value: 10
    },
    {
        uid: 'wither-saga',
        question: 'Jaki autor stworzył sagę "Wiedźmin"?',
        answers: {
            a: 'J.R.R. Tolkien',
            b: 'George R.R. Martin',
            c: 'Andrzej Sapkowski',
            d: 'Terry Pratchett',
        },
        updatedAt: FieldValue.serverTimestamp(),
        correct: 'c',
        value: 10
    },
    {
        uid: 'elder-scrolls',
        question: 'Która z tych postaci jest protagonistą serii gier komputerowych "The Elder Scrolls"?',
        answers: {
            a: 'Arthas Menethil',
            b: 'Ezio Auditore',
            c: 'Geralt z Rivii',
            d: 'Dovahkiin',
        },
        updatedAt: FieldValue.serverTimestamp(),
        correct: 'd',
        value: 15
    }
];

export default questionsSeed;
