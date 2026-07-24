import {PinType} from '@/Enum/PinType';
import {
    faCamera,
    faCompass,
    faGhost,
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

    if (pinType === PinType.GHOST) {
        return faGhost;
    }

    if (pinType === PinType.GEOCACHING) {
        return faCompass;
    }

    return faCamera;
}
