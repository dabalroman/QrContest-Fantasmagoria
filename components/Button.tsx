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
        class: 'border-gray-600 text-text-dim'
    },
    [ButtonState.ENABLED]: {
        class: 'border-button-base'
    },
    [ButtonState.PENDING]: {
        class: 'border-yellow-500 bg-yellow-100'
    },
    [ButtonState.CORRECT]: {
        class: ' border-lime-400 bg-lime-100'
    },
    [ButtonState.INCORRECT]: {
        class: ' border-red-600 bg-red-100'
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
                'p-2 block text-center text-text-accent border-2 rounded-full text-lg font-semibold'
                + ' bg-input-background border-button-border backdrop-blur-sm'
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
