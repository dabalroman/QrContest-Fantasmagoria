import { PinType, getPinTypeFriendlyName } from '@/Enum/PinType';
import PinMarkerIcon from '@/components/map/PinMarkerIcon';

const PIN_TYPE_DESCRIPTIONS: Record<PinType, string> = {
    [PinType.CODE]: 'Zeskanuj kod QR ukryty gdzieś w pobliżu.',
    [PinType.RIDDLE]: 'Rozwiąż zagadkę i wpisz hasło.',
    [PinType.VISIT]: 'Po prostu dotrzyj na miejsce.',
    [PinType.FEEDBACK]: 'Oceń wysłuchaną prelekcję.',
    [PinType.PHOTO]: 'Zrób zdjęcie i wyślij je z aplikacji.',
    [PinType.GHOST]: 'Miejsce, którego nie ma. Kodu szukaj gdzie indziej niż na mapie.'
};

export default function PinTypeLegend () {
    return (
        <ul className="flex flex-col gap-3">
            {Object.values(PinType).map((type: PinType) => (
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
