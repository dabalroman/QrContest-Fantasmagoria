import ScreenTitle from '@/components/ScreenTitle';
import React, { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import Metatags from '@/components/Metatags';
import useCollectedCards from '@/hooks/useCollectedCards';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import CardClue from '@/models/CardClue';
import Panel from '@/components/Panel';
import { Page } from '@/Enum/Page';
import LinkButton from '@/components/LinkButton';

export default function CluePage ({}) {
    const {
        clues
    } = useCollectedCards();
    const [loading, setLoading] = useState<boolean>(!clues);

    useEffect(() => {
        setLoading(!clues);
    }, [clues]);

    const router = useRouter();
    let { cardId } = router.query as { cardId: string | string[] | undefined | null };

    if (typeof cardId !== 'string') {
        cardId = null;
    }

    const clue = clues?.get()
        .find((clue: CardClue) => clue.uid === cardId) ?? null;

    useDynamicNavbar({
        href:`${Page.COLLECTION}#secret`,
        icon: faArrowLeft
    });

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Wskazówka"/>
            <ScreenTitle>Wskazówka</ScreenTitle>
            {loading && <Loader/>}
            {!loading && clue && (
                <Panel title={clue.title}>
                    <p>{clue.description}</p>
                    {clue.image && <img className="mt-4 w-full" src={`/clues/${clue.image}.webp`} alt="clue"/>}
                </Panel>)
            }
            {!loading && !clue && (
                <Panel title='Zgubiłeś się?'>
                    <p>To, czego szukasz, nie istnieje.</p>
                    <LinkButton href={Page.COLLECTION} className='mt-4'>Wróć do kolekcji</LinkButton>
                </Panel>
            )}
        </main>
    );
}
