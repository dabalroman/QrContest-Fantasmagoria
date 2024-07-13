import {useForm} from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '@/models/Card';
import ScreenTitle from '@/components/ScreenTitle';
import Panel from '@/components/Panel';
import Button from '@/components/Button';
import useCollectedCards from '@/hooks/useCollectedCards';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import {Page} from '@/Enum/Page';
import {collection, DocumentReference, getDocs, limit, query, updateDoc, where} from '@firebase/firestore';
import {firestore} from '@/utils/firebase';
import {FireDoc} from '@/Enum/FireDoc';
import {CardTier, getCardTierFriendlyName} from '@/Enum/CardTier';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import {faCamera} from '@fortawesome/free-solid-svg-icons';
import useAdminOnly from '@/hooks/useAdminOnly';

export default function EditCardAdminPage() {
    useAdminOnly();

    const router = useRouter();
    const {cardSets} = useCollectedCards();
    const [card, setCard] = useState<Card | null>(null);

    const [cardRef, setCardRef] = useState<DocumentReference | null>(null);

    useDynamicNavbar({
        icon: faCamera,
        href: Page.SCANNER
    });

    let {code} = router.query as { code: string | string[] | undefined | null };

    useEffect(() => {
        if (!code || typeof code !== 'string') {
            return;
        }

        const cardRef = query(collection(firestore, FireDoc.CARDS), where('code', '==', code), limit(1))
            .withConverter(Card.getConverter());

        getDocs(cardRef)
            .then((card) => {
                if (card.empty) {
                    toast.error('Karta nie została znaleziona.');
                }

                setCardRef(card.docs[0].ref);
                setCard(card.docs[0].data() as Card);
            })
            .catch((error) => {
                toast.error('Błąd aplikacji. ' + error.message);
            });
    }, [code]);

    const {
        register,
        handleSubmit,
        formState,
        setValue
    } = useForm({
        mode: 'onChange'
    });

    useEffect(() => {
        if (!card) {
            return;
        }

        setValue('code', card.code);
        setValue('isActive', card.isActive);
        setValue('withQuestion', card.withQuestion);
        setValue('comment', card.comment);
    }, [card, setValue]);

    const updatePost = async (content: any) => {
        if (!cardRef) {
            toast.error('Błąd aplikacji.');
            return;
        }

        try {
            await updateDoc(cardRef, {
                code: content.code,
                isActive: content.isActive,
                withQuestion: content.withQuestion,
                comment: content.comment
            });
        } catch (error: any) {
            toast.error('Błąd zapisu: ' + error.message);
        }

        toast.success('Karta zapisana.');
    };

    console.log(formState.errors);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Edycja karty</ScreenTitle>

            <Panel title={card?.name} loading={!cardSets}>
                <form onSubmit={handleSubmit(updatePost)}>
                    <div className="w-full grid grid-cols-[1fr_6rem] relative">
                        <div className="pr-2">
                            <p className="py-0.5">Wartość: {card?.value}</p>
                            <p className="py-0.5">Klasa: {getCardTierFriendlyName(card?.tier ?? CardTier.RARE)}</p>
                            <p className="py-0.5">Kolekcja: {cardSets?.get()
                                .find((set) => set.uid === card?.cardSet)?.name}</p>
                            <div>
                                <p className="pr-2">Kod</p>
                                <input type="text" placeholder="ABCDEFGHIJ" className="p-2 w-full input-background"
                                       {...register(
                                           'code',
                                           {
                                               required: 'Kod jest wymagany.',
                                               pattern: {
                                                   value: /^[A-Z0-9]{10}$/i,
                                                   message: 'Kod jest niepoprawny.'
                                               }
                                           }
                                       )} />
                            </div>
                        </div>
                        <div
                            className={
                                'relative border-6 rounded-xl bg-background bg-center bg-cover shadow-card'
                                + ` h-full border-card-border`
                            }
                            style={{
                                'backgroundImage': `url(/cards-thumbnails/${card?.image}.webp)`
                            }}
                        >
                        </div>
                    </div>

                    <div className="py-4">
                        <p>Komentarz</p>
                        <input type="text" placeholder="4 Privet Drive, komórka pod schodami."
                               className="p-2 w-full bg-input-background"
                               {...register('comment')} />
                    </div>
                    <fieldset>
                        <input type="checkbox" placeholder="isActive" className="m-2"
                               {...register('isActive', {})} />
                        <label> Kod aktywny?</label>
                    </fieldset>
                    <fieldset>
                        <input type="checkbox" placeholder="withQuestion" className="m-2"
                               {...register('withQuestion', {})}  />
                        <label> Z pytaniem?</label>
                    </fieldset>

                    {formState.errors && (
                        <p className="mt-2 text-center">{Object.values(formState.errors)
                            .map(e => e?.message)
                            .join(' ')}</p>)}

                    <Button type="submit" className="w-full mt-2">Zapisz </Button>
                </form>
            </Panel>
        </main>
    );
}
