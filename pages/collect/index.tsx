import Metatags from '@/components/Metatags';
import CollectedCardComponent from '@/components/collect/CollectedCardComponent';
import Card from '@/models/Card';
import { CardTier } from '@/Enum/CardTier';
import { CardCollection } from '@/Enum/CardCollection';

export default function CollectPage ({ code = null }: { code?: string | null }) {
    const card = {
        'image': 'azurnoctis',
        'uid': 'azurnoctis',
        'score': 30,
        'tier': 'legendary',
        'question': null,
        'name': 'Azurnoctis',
        'description': 'Niebieski smok o rogach niczym szafirowe obeliski, skrzydła rozpostarte szeroko jak północne zorze, tchnienie zimne jak najgłębsze odmęty oceanu, spoglądający na świat z tajemniczą łagodnością.',
        'collection': 'mystic',
        'value': 30,
        'withQuestion': true,
        'collectedAt': {
            '_seconds': 1686513961,
            '_nanoseconds': 189000000
        }
    };

    const cardObj = new Card(
        card.uid,
        card.name,
        null,
        card.tier as CardTier,
        card.collection as CardCollection,
        card.image,
        card.description,
        card.withQuestion,
        true,
        []
    );

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Szukaj"/>
            <h1 className="font-fancy text-4xl uppercase text-right">Szukaj</h1>
            <CollectedCardComponent card={cardObj}/>
        </main>
    );
}
