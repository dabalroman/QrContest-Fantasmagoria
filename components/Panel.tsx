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
                'p-4 rounded-md shadow-panel'
                + ' bg-gradient-to-b from-panel-transparent to-panel-transparent-end relative'
                + (margin ? ' my-4' : '')
                + ' ' + className
            }
        >
            <div className={loading ? 'blur-sm pointer-events-none' : ''}>
                {title && <h2 className="text-2xl font-fancy-capitals pb-2">{title}</h2>}
                {children}
            </div>
            {loading && <Loader/>}
        </div>
    );
}
