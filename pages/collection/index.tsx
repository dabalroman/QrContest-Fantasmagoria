import ScreenTitle from '@/components/ScreenTitle';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import CardsGroupComponent from '@/components/collection/CardsGroupComponent';
import Metatags from '@/components/Metatags';
import useCollectedCards from '@/hooks/useCollectedCards';

export default function CollectionPage ({}) {
    const { cards } = useCollectedCards();
    const [loading, setLoading] = useState<boolean>(!cards);

    useEffect(() => {
        setLoading(!cards);
    }, [cards]);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Kolekcja"/>
            <ScreenTitle>Kolekcja</ScreenTitle>
            <div>
                {loading && <Loader/>}
                {!loading && cards &&
                    <CardsGroupComponent
                        title="Mistyczne stworzenia"
                        description={'Te niezwykłe istoty, posiadające nadprzyrodzone moce i umiejętności,'
                            + ' były mi znane tylko z opowieści i legend, ale teraz mam je przed sobą.'}
                        cards={cards.get()}
                    />
                }
            </div>
        </main>
    );
}
