import { RankingRound } from '../types/rankingRound';

const rankingRoundsSeed: RankingRound[] = [
    {
        uid: '1',
        name: 'Runda pierwsza',
        from: new Date('2023-06-24 00:00:00 GMT+0200'),
        to: new Date('2023-06-24 23:59:59 GMT+0200'),
        users: {}
    },
    {
        uid: '2',
        name: 'Runda druga',
        from: new Date('2023-06-25 00:00:00 GMT+0200'),
        to: new Date('2023-06-25 18:00:00 GMT+0200'),
        users: {}
    },
    {
        uid: 'fallback',
        name: 'fallback',
        from: new Date('2000-01-01 00:00:00 GMT+0200'),
        to: new Date('2100-01-01 23:59:59 GMT+0200'),
        users: {}
    }
];

export default rankingRoundsSeed;
