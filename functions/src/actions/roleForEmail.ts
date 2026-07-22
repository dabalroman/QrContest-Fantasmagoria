import * as logger from 'firebase-functions/logger';
import { UserRole } from '../types/user';

function parseList(value: string | undefined): string[] {
    return (value ?? '')
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter((entry) => entry.length > 0);
}

/**
 * Never throws and never awaits: it runs on the only account-creation path in the app, outside
 * setupAccountHandle's try/catch, so anything it raises takes registration down with it.
 */
export default function roleForEmail(email?: string, emailVerified?: boolean): UserRole {
    if (typeof email !== 'string') {
        return UserRole.USER;
    }

    const normalized = email.trim().toLowerCase();

    if (parseList(process.env.ADMIN_EMAILS).includes(normalized)) {
        // The app sends no verification mail, so email/password registration never clears this gate
        // and silently yields a plain user - role is written once, at creation. Register the admin
        // with Google sign-in; this log is how you find out when someone did not.
        if (emailVerified !== true) {
            logger.warn('ROLE_LISTED_BUT_UNVERIFIED', normalized);
            return UserRole.USER;
        }

        return UserRole.ADMIN;
    }

    // No verification gate on dashboard, deliberately: it grants no data access at all - firestore
    // rules key off role == 'admin' only, and no callable reads it - so it merely pins the account
    // to /dashboard and takes away the ability to play. The TV account registers by email/password.
    if (parseList(process.env.DASHBOARD_EMAILS).includes(normalized)) {
        return UserRole.DASHBOARD;
    }

    return UserRole.USER;
}
