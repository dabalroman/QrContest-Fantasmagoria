// Carries a scanned code across the registration detour, so a player who scanned a QR while logged
// out does not have to rescan it afterwards. sessionStorage, not localStorage: it dies with the tab,
// so a stale code cannot resurface days later, and it survives the signInWithPopup round-trip because
// that stays in the same tab. Mirrors the best-effort idiom in utils/mapView.ts.

import { Page } from '@/Enum/Page';

const STORAGE_KEY = 'pending-code';
const CODE_PATTERN = /^[A-Z0-9]{10}$/;

export function savePendingCode (code: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Validated here so nothing downstream has to: a junk URL segment is simply never stashed.
    const normalized = code.trim().toUpperCase();
    if (!CODE_PATTERN.test(normalized)) {
        return;
    }

    try {
        window.sessionStorage.setItem(STORAGE_KEY, normalized);
    } catch {
        // Quota / private-mode / disabled storage - the shortcut is best-effort, never fatal.
    }
}

export function peekPendingCode (): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return window.sessionStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function clearPendingCode (): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // See savePendingCode.
    }
}

// The single place the "where does a ready user go now" decision lives. Clearing here is what makes
// the stash strictly single-use - the code lives in the URL from this point on, so a stash that
// outlived its own redirect would yank the player back to a code they already collected.
export function destinationAfterAuth (): string {
    const code = peekPendingCode();

    if (!code) {
        return Page.MAP;
    }

    clearPendingCode();

    return `${Page.COLLECT}/${code}`;
}
