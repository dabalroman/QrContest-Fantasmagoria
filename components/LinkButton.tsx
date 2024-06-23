import React, { ReactNode } from 'react';
import Link from 'next/link';

export default function LinkButton ({
    children,
    className,
    href
}: { children: ReactNode, className?: string, href: string }) {
    return (
        <Link
            className={
                'p-2 block text-center text-text-base border-4 border-button-base rounded-xl text-lg'
                + ' shadow-panel bg-button-gradient'
                + ' ' + className
            }
            href={href}
        >
            {children}
        </Link>
    );
}
