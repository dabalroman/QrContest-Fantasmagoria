import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export default function NavbarButton ({ icon }: { icon: IconProp }) {
    return (
        <div className="p-4 text-button-brown"><FontAwesomeIcon icon={icon}/></div>
    );
}
