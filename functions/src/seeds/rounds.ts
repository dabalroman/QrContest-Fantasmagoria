import { RoundsCollection } from '../types/round';

const roundsSeed: RoundsCollection = {
    '1': {
        uid: '1',
        name: 'Runda pierwsza',
        from: new Date('2023-06-24 00:00:00 GMT+0200'),
        to: new Date('2023-06-24 23:59:59 GMT+0200')
    },
    '2': {
        uid: '2',
        name: 'Runda druga',
        from: new Date('2023-06-25 00:00:00 GMT+0200'),
        to: new Date('2023-06-25 23:59:59 GMT+0200')
    }
};

export default roundsSeed;
