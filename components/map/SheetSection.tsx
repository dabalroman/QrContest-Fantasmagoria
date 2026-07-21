import { ReactNode } from 'react';
import Loader from '@/components/Loader';

// Panel's counterpart for the map sheet. Panel is a 30%-alpha light grey that needs the background
// image behind it; the drawer is a solid fill, so a Panel there resolves to within 6/255 of its own
// surface and reads as nothing. `raised` goes LIGHTER than the drawer rather than darker (~18 L* of
// separation), and exactly one section per sheet gets it — whatever the player must act on, or the
// terminal status when there is nothing left to do. Keeps Panel's `loading` contract, which is
// functional: it blocks pointer events while a collect is in flight.
export default function SheetSection ({
    title,
    loading = false,
    raised = false,
    children
}: { title?: string, loading?: boolean, raised?: boolean, children: ReactNode }) {
    return (
        <section
            className={
                'relative mt-6'
                + (raised ? ' rounded-xl bg-white/60 p-4 shadow-panel' : '')
            }
        >
            {title &&
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-accent">
                    {title}
                </h2>
            }
            <div className={loading ? 'blur-sm pointer-events-none' : ''}>
                {children}
            </div>
            {loading && <Loader/>}
        </section>
    );
}
