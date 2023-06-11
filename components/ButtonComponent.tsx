import React, { MouseEventHandler, ReactNode } from 'react';

export default function ButtonComponent ({
    children,
    onClick
}: { children: ReactNode, onClick?: MouseEventHandler<HTMLButtonElement> }) {
    return (
        <button
            className={
                'p-3 text-center text-button-brown border-4 border-button-brown rounded-xl'
                + ' shadow-panel bg-gradient-button'
            }
            style={{ 'background': 'linear-gradient(175deg, #C59251 10%, #FCCE8A 50%, #C59251 90%)' }}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
