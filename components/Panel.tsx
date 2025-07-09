import { ReactNode, useState } from 'react';
import Loader from '@/components/Loader';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Panel ({
    title,
    children,
    closeable = false,
    closeableUuid = '0000',
    margin = true,
    loading = false,
    className = ''
}: {
    children: ReactNode,
    closeable?: boolean,
    closeableUuid?: string,
    margin?: boolean,
    loading?: boolean,
    className?: string,
    title?: string
}) {
    const [isClosed, setClosed] = useState<boolean>(closeable && localStorage.getItem('closeable-' + closeableUuid) === 'closed');

    if (isClosed) {
        return null;
    }

    const close = () => {
        localStorage.setItem('closeable-' + closeableUuid, 'closed');
        setClosed(true);
    }

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
                <div className="flex justify-between items-start">
                    {title && <h2
                      className="text-3xl font-base tracking-wider font-semibold pb-2 text-left text-text-accent">{title}</h2>}
                    {closeable && <FontAwesomeIcon className="text-text-accent opacity-60" icon={faClose} size="2x" onClick={close}/>
                    }
                </div>
                {children}
            </div>
            {loading && <Loader/>}
        </div>
    );
}
