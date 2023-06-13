import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem } from '@fortawesome/free-solid-svg-icons';
import Metatags from '@/components/Metatags';

export default function Home () {
    return (
        <>
            <main>
                <Metatags/>
                <FontAwesomeIcon icon={faGem}/>
                <Link href={'enter'}>Enter</Link>
            </main>
        </>
    );
}

