export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    DASHBOARD = 'dashboard'
}

export function isUserRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
}
