import { PinType, getPinTypeFriendlyName } from '@/Enum/PinType';
import PinMarkerIcon from '@/components/map/PinMarkerIcon';

const PIN_TYPE_DESCRIPTIONS: Record<PinType, string> = {
    [PinType.CODE]: 'Zeskanuj kod QR ukryty gdzieś w pobliżu.',
    [PinType.RIDDLE]: 'Rozwiąż zagadkę i wpisz odpowiedź.',
    [PinType.VISIT]: 'Dotrzyj we wskazane miejsce.',
    [PinType.FEEDBACK]: 'Oceń wysłuchaną prelekcję.',
    [PinType.PHOTO]: 'Zrób zdjęcie, a punkty dostaniesz po chwili.',
    [PinType.GHOST]: 'Miejsce, którego nie ma. Kodu szukaj gdzie indziej niż na mapie.'
};

const LISTED_PIN_TYPES = Object.values(PinType).filter((type) => type !== PinType.GHOST);

export default function PinTypeLegend () {
    return (
        <ul className="flex flex-col gap-3">
            {LISTED_PIN_TYPES.map((type: PinType) => (
                <li key={type} className="flex items-center gap-3">
                    <div className="shrink-0">
                        <PinMarkerIcon type={type}/>
                    </div>
                    <div>
                        <span className="block font-semibold text-text-accent">
                            {getPinTypeFriendlyName(type)}
                        </span>
                        <span className="block text-sm">{PIN_TYPE_DESCRIPTIONS[type]}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
}
