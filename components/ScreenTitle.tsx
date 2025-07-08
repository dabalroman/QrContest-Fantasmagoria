import { ReactNode } from 'react';

export default function ScreenTitle ({ children }: { children: ReactNode }) {
    return <h1 className="font-base text-4xl font-medium uppercase text-right text-text-accent tracking-widest opacity-20">{children}</h1>;
}
