import { useRouter } from 'next/router';
import CollectPage from '@/pages/collect/index';

export default function CollectViaLinkPage () {
    const router = useRouter();
    const { code } = router.query;

    return (
        <CollectPage code={(typeof code === 'string' ? code.toUpperCase() : null)}/>
    );
}
