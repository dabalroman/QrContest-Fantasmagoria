import { ReactNode } from 'react';

const LABEL = 'absolute inset-0 flex items-center justify-center text-sm font-semibold';

export default function ProgressBar ({
    percentage,
    label,
    pulse = false
}: { percentage: number, label: ReactNode, pulse?: boolean }) {
    const filled = Math.min(Math.max(percentage, 0), 100);

    return (
        <div className="w-full rounded-full border-2 border-text-accent/50 p-0.5">
            <div className="relative h-6 rounded-full bg-text-accent/20 overflow-hidden">
                <div
                    className={'h-full rounded-full bg-text-accent' + (pulse ? ' animate-pulse' : '')}
                    style={{ width: filled + '%' }}
                />
                <span className={LABEL + ' text-text-accent'}>{label}</span>
                <span
                    className={LABEL + ' text-text-light'}
                    style={{ clipPath: `inset(0 ${100 - filled}% 0 0)` }}
                >
                    {label}
                </span>
            </div>
        </div>
    );
}
