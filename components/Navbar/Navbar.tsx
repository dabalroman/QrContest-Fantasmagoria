import { faHouse, faImages, faMagnifyingGlassLocation, faTrophy, faUser } from '@fortawesome/free-solid-svg-icons';
import NavbarButton from '@/components/Navbar/NavbarButton';
import NavbarSuperButton from '@/components/Navbar/NavbarSuperButton';

export default function Navbar () {

    return (
        <div
            className="grid grid-cols-5 align-center justify-items-center text-3xl
            bg-background-transparent fixed bottom-0 w-screen">
            <NavbarButton icon={faMagnifyingGlassLocation}/>
            <NavbarButton icon={faImages}/>
            <NavbarSuperButton icon={faHouse}/>
            <NavbarButton icon={faTrophy}/>
            <NavbarButton icon={faUser}/>
        </div>
    );
}
