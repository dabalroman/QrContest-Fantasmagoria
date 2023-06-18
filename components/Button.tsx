import React, { MouseEventHandler, ReactNode } from 'react';

export default function Button ({
    children,
    onClick,
    className,
    type = 'button',
    disabled = false
}: {
    children: ReactNode,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'],
    disabled?: boolean,
    className?: string
}) {
    return (
        <button
            className={
                'p-3 block text-center text-button-brown border-4 border-button-brown rounded-xl'
                + ' shadow-panel'
                + (disabled ? ' border-gray-600 text-w cursor-auto' : '')
                + ' ' + className
            }
            style={{
                'background': (!disabled
                    ? 'linear-gradient(175deg, #C59251 10%, #FCCE8A 50%, #C59251 90%)'
                    : 'linear-gradient(175deg, #8C8C8C 10%, #C2C2C2 50%, #8C8C8C 90%)')
            }}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
