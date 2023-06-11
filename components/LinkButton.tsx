import React, { MouseEventHandler, ReactNode } from 'react';
import Link from 'next/link';

export default function LinkButton ({
    children,
    href
}: { children: ReactNode, href: string }) {
    return (
        <Link
            className={
                'p-3 block text-center text-button-brown border-4 border-button-brown rounded-xl'
                + ' shadow-panel bg-gradient-button'
            }
            style={{ 'background': 'linear-gradient(175deg, #C59251 10%, #FCCE8A 50%, #C59251 90%)' }}
            href={href}
        >
            {children}
        </Link>
    );
}
