import { useRouter } from 'next/router';
import CollectPage from '@/pages/collect/index';

export default function CollectViaLinkPage () {
    const router = useRouter();
    const { code } = router.query;

    if (typeof code !== 'string') {
        return <CollectPage code={null}/>;
    }

    return <CollectPage code={code.toUpperCase()}/>;
}
