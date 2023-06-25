import { RankingRound } from '../types/rankingRound';

const rankingRoundsSeed: RankingRound[] = [
    {
        uid: '1',
        name: 'pierwsza',
        from: new Date('2023-06-24 00:00:00 GMT+0200'),
        to: new Date('2023-06-27 23:59:59 GMT+0200'),
        users: {}
    },
    {
        uid: '2',
        name: 'druga',
        from: new Date('2023-06-28 00:00:00 GMT+0200'),
        to: new Date('2023-06-30 18:00:00 GMT+0200'),
        users: {}
    },
];

export default rankingRoundsSeed;
