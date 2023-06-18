import { Question } from '../firestoreTypes';

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
        correct: 'a',
        value: 10
    }
];

export default questionsSeed;
