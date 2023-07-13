import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { useEffect, useState } from 'react';

export default function DashboardPage () {
    useDynamicNavbar({
        onlyCenter: true
    });

    const [screenId, setScreenId] = useState<number>(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setScreenId((prev) => (prev + 1) % 3);
        }, 5000);

        return () => clearTimeout(timeout);
    });

    return (
        <div className="fixed top-0 left-0 w-screen h-screen bg-red-800 z-50 text-white font-sans font-bold">
            {screenId === 0 &&
                <div
                    className="w-full h-full fill bg-center bg-cover"
                    style={{
                        'backgroundImage': `url(/dashboard/splash.webp)`
                    }}
                ></div>
            }
            {screenId === 1 &&
                <div className="w-full h-full flex justify-center items-center">
                    <p style={{fontSize: '150px'}}>Pij wodę!</p>
                </div>
            }
            {screenId === 2 &&
                <div className="w-full h-full flex flex-col justify-center bg-blue-900 p-20">
                    <p style={{fontSize: '150px'}}>Wielki Turniej Karaoke</p>
                    <p style={{fontSize: '80px'}}>21:00 - 23:00</p>
                    <p style={{fontSize: '80px'}}>Arena</p>
                </div>
            }
        </div>
    );
};
