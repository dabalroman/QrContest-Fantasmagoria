import React, { MouseEventHandler, ReactNode } from 'react';

export default function Button ({
    children,
    onClick,
    className,
    type = 'button',
    disabled = false,
}: {
    children: ReactNode,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    type: React.ButtonHTMLAttributes<HTMLButtonElement>['type'],
    disabled?: boolean,
    className?: string
}) {
    return (
        <button
            className={
                'p-3 block text-center text-button-brown border-4 border-button-brown rounded-xl'
                + ' shadow-panel bg-gradient-button'
                + ' ' + className
            }
            style={{ 'background': 'linear-gradient(175deg, #C59251 10%, #FCCE8A 50%, #C59251 90%)' }}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
