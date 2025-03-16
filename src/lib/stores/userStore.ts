import { writable, type Writable } from 'svelte/store';
import { getCurrentUser } from '../appwrite';
import { browser } from '$app/environment';

export type User = {
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    status: boolean;
    prefs: Record<string, any>;
    profilePicture?: string;
};

// Create individual stores
export const user = writable<User | null>(null);
export const isLoading = writable(true);
export const error = writable<string | null>(null);

// Initialize user store
export async function initUserStore(): Promise<void> {
    if (!browser) return;
    
    isLoading.set(true);
    error.set(null);

    try {
        const currentUser = await getCurrentUser();
        user.set(currentUser);
    } catch (err) {
        console.error('Error initializing user store:', err);
        user.set(null);
        error.set(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
        isLoading.set(false);
    }
}

export function updateUser(userData: User): void {
    user.set(userData);
}

export function clearUser(): void {
    user.set(null);
    error.set(null);
}

// Initialize store in browser
if (browser) {
    initUserStore();
} 