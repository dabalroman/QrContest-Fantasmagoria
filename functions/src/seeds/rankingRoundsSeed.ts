import { RankingRound } from '../types/rankingRound';

const rankingRoundsSeed: RankingRound[] = [
    {
        uid: '1',
        name: 'pierwsza',
        from: new Date('2023-07-14 15:00:00 GMT+0200'),
        to: new Date('2023-07-15 13:59:59 GMT+0200'),
        users: {},
        guilds: {}
    },
    {
        uid: '2',
        name: 'druga',
        from: new Date('2023-07-15 14:00:00 GMT+0200'),
        to: new Date('2023-07-16 12:00:00 GMT+0200'),
        users: {},
        guilds: {}
    },
];

export default rankingRoundsSeed;
