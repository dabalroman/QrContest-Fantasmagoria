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
                'p-2 block text-center text-text-accent border-2 border-button-base rounded-full text-lg font-semibold'
                + ' bg-input-background border-button-border backdrop-blur-sm'
                + ' ' + className
            }
            href={href}
        >
            {children}
        </Link>
    );
}
