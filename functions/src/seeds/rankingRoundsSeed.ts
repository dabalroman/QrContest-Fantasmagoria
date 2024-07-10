import { RankingRound, RankingRoundGuilds, RankingRoundUsers } from '../types/rankingRound';

const rankingRoundsSeed: RankingRound[] = [
    {
        uid: '1',
        name: 'pierwsza',
        finished: false,
        from: new Date('2024-07-10 00:00:00 GMT+0200'),
        to: new Date('2024-07-11 13:59:59 GMT+0200'),
        users: {} as RankingRoundUsers,
        guilds: {} as RankingRoundGuilds
    },
    {
        uid: '2',
        name: 'druga',
        finished: false,
        from: new Date('2024-07-11 14:00:00 GMT+0200'),
        to: new Date('2024-07-12 12:00:00 GMT+0200'),
        users: {} as RankingRoundUsers,
        guilds: {} as RankingRoundGuilds
    }
];

export default rankingRoundsSeed;
