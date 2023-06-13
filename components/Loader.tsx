import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';

export default function Loader () {
    return (
        <div className={
            'flex flex-col justify-center items-center w-full h-full absolute top-0 left-0'
            + ' bg-gradient-radial from-panel-transparent-end to-transparent'
        }>
            <FontAwesomeIcon className="p-2" icon={faDiceD6} size="3x" spin/>
            <p className="p-2 font-fancy">Ładowanie...</p>
        </div>
    );
}
