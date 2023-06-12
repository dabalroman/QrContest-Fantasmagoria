import { ReactNode } from 'react';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Panel ({
    children,
    margin = true,
    loading = false,
    className = ''
}: { children: ReactNode, margin?: boolean, loading?: boolean, className?: string }) {
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
                {children}
            </div>
            {loading && (
                <div className={
                    'flex flex-col justify-center items-center w-full h-full absolute top-0 left-0'
                    + ' bg-gradient-radial from-panel-transparent-end to-transparent'
                }>
                    <FontAwesomeIcon className="p-2" icon={faDiceD6} size="3x" spin/>
                    <p className="p-2 font-fancy">Ładowanie...</p>
                </div>
            )}
        </div>
    );
}
