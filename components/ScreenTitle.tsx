import { ReactNode } from 'react';

export default function ScreenTitle ({ children }: { children: ReactNode }) {
    return <h1 className="font-fancy text-4xl uppercase text-right">{children}</h1>;
}
