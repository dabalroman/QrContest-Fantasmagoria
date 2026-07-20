import toast from 'react-hot-toast';
import { RawAchievementGrant } from '@/models/Raw';
import AchievementIcon from '@/components/achievements/AchievementIcon';

// Fires one celebratory toast per newly-unlocked achievement after a collect/answer. Reuses the plain
// react-hot-toast API (like `toast('...', { icon: '🎲' })` elsewhere) — a default toast already is the
// single-line accent pill we want, so no bespoke component and no Tailwind safelist concern.
//
// Timing is deliberate: hold ~1.2s so the navbar `+points` beat lands first, then stagger the toasts so
// a multi-unlock gets one beat per badge. The scheduled callback closes over ONLY the immutable grant
// data + the global `toast`, so a timer firing after the collect view unmounts is safe (the app-root
// <Toaster> paints it). No cancellation/dedup: two rapid collects each show their own unlocks, correctly.
export const ACHIEVEMENT_TOAST_DELAY_MS = 1200;
export const ACHIEVEMENT_TOAST_STAGGER_MS = 300;

export default function scheduleAchievementToasts (grants: RawAchievementGrant[]): void {
    grants?.forEach((grant, index) => {
        window.setTimeout(
            () => toast(
                `Zdobyto: ${grant.name} +${grant.bonus} pkt`,
                { icon: <AchievementIcon iconKey={grant.icon}/> }
            ),
            ACHIEVEMENT_TOAST_DELAY_MS + index * ACHIEVEMENT_TOAST_STAGGER_MS
        );
    });
}
