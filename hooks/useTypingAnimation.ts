import { useCallback, useEffect, useRef } from 'react';

const TYPING_INTERVAL_MS = 150;

// onType is mirrored into a ref so a re-render never restarts a running animation - every tick writes
// into a form, which re-renders, which would otherwise rebuild the callback and retrigger the interval.
export default function useTypingAnimation (onType: (text: string) => void) {
    const intervalRef = useRef<number | null>(null);
    const onTypeRef = useRef<(text: string) => void>(() => undefined);

    useEffect(() => {
        onTypeRef.current = onType;
    });

    const stop = useCallback(() => {
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => stop, [stop]);

    return useCallback((target: string) => {
        stop();

        let length = 0;
        intervalRef.current = window.setInterval(() => {
            length += 1;
            onTypeRef.current(target.slice(0, length));

            if (length >= target.length) {
                stop();
            }
        }, TYPING_INTERVAL_MS);
    }, [stop]);
}
