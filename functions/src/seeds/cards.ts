import { Card, CardTier, CardTierValue } from '../types/card';

const cardsSeed: Card[] = [
    {
        uid: 'azurnoctis',
        cardSet: 'mystic_creatures',
        code: 'QWERTY1234',
        collectedBy: {},
        description: 'Fioletowy smok, o rogach niczym szafirowe obeliski, skrzydła rozpostarte szeroko jak północne zorze, tchnienie zimne jak najgłębsze odmęty oceanu, spoglądający na świat z tajemniczą łagodnością.',
        image: 'azurnoctis',
        isActive: true,
        name: 'Azurnoctis',
        tier: CardTier.LEGENDARY,
        value: CardTierValue.LEGENDARY,
        withQuestion: true
    }
];

export default cardsSeed;
