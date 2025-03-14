import { Writable } from 'svelte/store';

export interface User {
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    status: boolean;
    prefs: Record<string, any>;
}

export const user: Writable<User | null>;
export const isLoading: Writable<boolean>;
export const isPublicPage: Writable<boolean>;
export function initUserStore(): Promise<void>;
export function updateUser(userData: User): void;
export function clearUser(): void; 