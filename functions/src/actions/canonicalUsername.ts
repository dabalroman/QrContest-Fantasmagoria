// The users-usernames doc id. Imported by the client too (pages/auth/account-setup.tsx) so the
// availability check and the reservation can never key on different strings - keep it dependency-free.
export default function canonicalUsername (username: string): string {
    return username.trim().toLowerCase();
}
