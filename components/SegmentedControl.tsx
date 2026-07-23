import React from 'react';

export interface SegmentedOption<T extends string> {
    value: T;
    label: string;
}

export default function SegmentedControl<T extends string> ({
    options,
    value,
    onChange,
    className
}: {
    options: SegmentedOption<T>[],
    value: T,
    onChange: (value: T) => void,
    className?: string
}) {
    return (
        <div
            className={'flex rounded-full border-2 border-button-border bg-input-background overflow-hidden'
                + (className ? ' ' + className : '')}
        >
            {options.map((option, index) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        className={'flex-1 p-2 text-center text-lg font-semibold text-text-accent'
                            + (index > 0 ? ' border-l-2 border-button-border' : '')}
                        style={active ? {
                            background: 'var(--color-primary)',
                            color: 'var(--color-text-light)'
                        } : {}}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
