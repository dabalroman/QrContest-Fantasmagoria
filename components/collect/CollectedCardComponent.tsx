import CardComponent from '@/components/CardComponent';
import PanelComponent from '@/components/PanelComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import Card from '@/models/Card';
import ButtonComponent from '@/components/ButtonComponent';

export default function CollectedCardComponent ({ card }: { card: Card }) {
    return (
        <div className="relative h-full flex flex-col">
            <CardComponent card={card} className="z-50 relative top-3 grow w-full"/>
            <PanelComponent margin={false} className="text-center pt-10 relative bottom-3 z-0 rounded-b-2xl">
                <p className='pb-3'>Dodano do kolekcji!</p>
                <ButtonComponent>
                    Kliknij, by odebrać Twoje <FontAwesomeIcon icon={faDiceD6} size="sm"/> rubiki.
                </ButtonComponent>
            </PanelComponent>
        </div>
    );
}
