import { faHouse, faImages, faMagnifyingGlassLocation, faTrophy, faUser } from '@fortawesome/free-solid-svg-icons';
import NavbarButton from '@/components/Navbar/NavbarButton';
import NavbarSuperButton from '@/components/Navbar/NavbarSuperButton';
import { Page } from '@/Enum/Page';

export default function Navbar () {
    return (
        <div
            className={'grid align-center justify-items-center text-3xl'
            + ' bg-background-transparent fixed bottom-0 w-screen z-50'}
            style={{gridTemplateColumns: 'repeat(2, 1fr) 100px repeat(2, 1fr)'}}
        >
            <NavbarButton href={Page.COLLECT} icon={faMagnifyingGlassLocation}/>
            <NavbarButton href={Page.COLLECTION} icon={faImages}/>
            <NavbarSuperButton href={Page.COLLECT} icon={faHouse}/>
            <NavbarButton href={Page.SCOREBOARD} icon={faTrophy}/>
            <NavbarButton href={Page.ACCOUNT} icon={faUser}/>
        </div>
    );
}
