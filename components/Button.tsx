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
        class: 'border-gray-600 bg-button-gradient'
    },
    [ButtonState.ENABLED]: {
        class: 'border-button-base bg-button-gradient'
    },
    [ButtonState.PENDING]: {
        class: 'border-yellow-500 bg-button-gradient'
    },
    [ButtonState.CORRECT]: {
        class: ' border-lime-400 bg-button-gradient'
    },
    [ButtonState.INCORRECT]: {
        class: ' border-red-600 bg-button-gradient'
    }
};

export default function Button ({
    children,
    onClick,
    className,
    style,
    type = 'button',
    state = ButtonState.ENABLED
}: {
    children: ReactNode,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    className?: string
    style?: object,
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'],
    state?: ButtonState,
}) {
    return (
        <button
            className={
                'p-2 block text-center text-text-base border-4 rounded-xl shadow-panel text-lg'
                + ' ' + stateToLookMap[state].class
                + ' ' + className
            }
            style={{ ...style}}
            type={type}
            onClick={onClick}
            disabled={state === ButtonState.DISABLED}
        >
            {children}
        </button>
    );
}
