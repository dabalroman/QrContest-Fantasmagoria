import { ReactNode } from 'react';
import Loader from '@/components/Loader';

export default function Panel ({
    title,
    children,
    margin = true,
    loading = false,
    className = ''
}: { children: ReactNode, margin?: boolean, loading?: boolean, className?: string, title?: string }) {
    return (
        <div
            className={
                'p-4 rounded-xl shadow-panel '
                + 'bg-panel-transparent relative backdrop-blur-md '
                + (margin ? ' my-4' : '')
                + ' ' + className
            }
        >
            <div className={loading ? 'blur-sm pointer-events-none' : ''}>
                {title && <h2 className="text-3xl font-base tracking-wider font-semibold pb-2 text-left text-text-accent">{title}</h2>}
                {children}
            </div>
            {loading && <Loader/>}
        </div>
    );
}
