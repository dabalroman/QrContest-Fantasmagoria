import { ReactNode } from 'react';

export default function ScreenTitle ({ children }: { children: ReactNode }) {
    return <h1 className="font-fancy-capitals text-4xl uppercase text-right drop-shadow">{children}</h1>;
}
