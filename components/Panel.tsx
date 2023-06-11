import { ReactNode } from 'react';

export default function Panel ({
    children,
    margin = true,
    className = ''
}: { children: ReactNode, margin?: boolean, className?: string }) {
    return (
        <div
            className={
                'p-4 rounded-md shadow-panel'
                + ' bg-gradient-to-b from-panel-transparent to-panel-transparent-end'
                + (margin ? ' my-4' : '')
                + ' ' + className
            }
        >
            {children}
        </div>
    );
}
