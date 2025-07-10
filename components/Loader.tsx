import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

export default function Loader () {
    return (
        <div className={
            'flex flex-col justify-center items-center w-full h-full fixed top-0 left-0'
            + ' bg-gradient-radial from-overlay-start via-overlay-via to-overlay-end text-text-accent z-20'
        }>
            <FontAwesomeIcon className="p-2" icon={faStar} size="3x" spin/>
            <p className="p-2 font-base">Ładowanie...</p>
        </div>
    );
}
