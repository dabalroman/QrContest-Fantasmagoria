import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export default function NavbarSuperButton ({ icon }: { icon: IconProp }) {
    return (
        <div className="relative w-24">
            <div
                className="p-4 text-4xl text-center text-button-brown border-4 border-button-brown rounded-full
                bg-background bottom-2 h-24 w-24 absolute flex justify-center content-center items-center">
                <FontAwesomeIcon icon={icon}/>
            </div>
        </div>
    );
}
