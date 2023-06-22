import React, { MouseEventHandler, ReactNode } from 'react';

export enum ButtonState {
    DISABLED,
    ENABLED,
    PENDING,
    CORRECT,
    INCORRECT,
}

const stateToLookMap = {
    [ButtonState.DISABLED]: {
        gradient: 'linear-gradient(175deg, #8C8C8C 10%, #C2C2C2 50%, #8C8C8C 90%)',
        class: 'border-gray-600'
    },
    [ButtonState.ENABLED]: {
        gradient: 'linear-gradient(175deg, #C59251 10%, #FCCE8A 50%, #C59251 90%)',
        class: 'border-button-brown'
    },
    [ButtonState.PENDING]: {
        gradient: 'linear-gradient(175deg, #C59251 10%, #FCCE8A 50%, #C59251 90%)',
        class: 'border-yellow-500'
    },
    [ButtonState.CORRECT]: {
        gradient: 'linear-gradient(175deg, #C59251 10%, #FCCE8A 50%, #C59251 90%)',
        class: ' border-lime-400'
    },
    [ButtonState.INCORRECT]: {
        gradient: 'linear-gradient(175deg, #C59251 10%, #FCCE8A 50%, #C59251 90%)',
        class: ' border-red-600'
    }
};

export default function Button ({
    children,
    onClick,
    className,
    type = 'button',
    state = ButtonState.ENABLED
}: {
    children: ReactNode,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'],
    state?: ButtonState,
    className?: string
}) {
    return (
        <button
            className={
                'p-3 block text-center text-button-brown border-4 rounded-xl shadow-panel'
                + ' ' + stateToLookMap[state].class
                + ' ' + className
            }
            style={{ 'background': (stateToLookMap[state].gradient) }}
            type={type}
            onClick={onClick}
            disabled={state === ButtonState.DISABLED}
        >
            {children}
        </button>
    );
}
