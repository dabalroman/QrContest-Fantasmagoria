import {PinType} from '@/Enum/PinType';
import {
    faCamera,
    faLocationDot,
    faMicrophone,
    faPuzzlePiece,
    faQrcode,
    IconDefinition
} from '@fortawesome/free-solid-svg-icons';

export default function getPinIcon(pinType: PinType): IconDefinition {
    if (pinType === PinType.CODE) {
        return faQrcode;
    }

    if (pinType === PinType.RIDDLE) {
        return faPuzzlePiece;
    }

    if (pinType === PinType.VISIT) {
        return faLocationDot;
    }

    if (pinType === PinType.FEEDBACK) {
        return faMicrophone;
    }

    return faCamera;
}
