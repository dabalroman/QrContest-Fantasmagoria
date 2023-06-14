import CardComponent from '@/components/CardComponent';
import Panel from '@/components/Panel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import Card from '@/models/Card';
import Button from '@/components/Button';

export default function CollectCardComponent ({ card }: { card: Card }) {
    return (
        <div className="relative h-full flex flex-col">
            <CardComponent card={card} className="z-50 relative top-3 grow w-full"/>
            <Panel margin={false} className="text-center pt-10 relative bottom-3 z-0 rounded-b-2xl">
                <p className='pb-3'>Dodano do kolekcji!</p>
                <Button className='w-full'>
                    Kliknij, by odebrać Twoje <FontAwesomeIcon icon={faDiceD6} size="sm"/> rubiki.
                </Button>
            </Panel>
        </div>
    );
}
