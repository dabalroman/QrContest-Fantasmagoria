import Link from 'next/link';

export default function AccountPage ({}) {
    return (
        <main>
            <h1>Account Page</h1>
            <Link href={'/enter'}>Login / logout</Link>
            <br/>
            <Link href={'/admin/card'}>Card</Link>
        </main>
    );
}
