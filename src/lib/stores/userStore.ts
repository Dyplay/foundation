import { writable, type Writable, get } from 'svelte/store';
import { getCurrentUser } from '../appwrite';

export type User = {
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    status: boolean;
    prefs: Record<string, any>;
    profilePicture?: string;
};

export const user: Writable<User | null> = writable(null);
export const isLoading: Writable<boolean> = writable(true);
export const isPublicPage: Writable<boolean> = writable(false);

/**
 * Check if the current page is a public page
 * @returns {boolean}
 */
const checkIfPublicPage = (): boolean => {
    const publicPaths = ['/auth', '/verify'];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    return publicPaths.some(path => currentPath.startsWith(path));
};

/**
 * Initialize the user store
 * @returns {Promise<void>}
 */
export const initUserStore = async (): Promise<void> => {
    isLoading.set(true);
    
    // Check if we're on a public page (auth, verify, etc.)
    const isOnPublicPage = checkIfPublicPage();
    isPublicPage.set(isOnPublicPage);
    
    // If we're on a public page, don't try to get the current user
    if (isOnPublicPage) {
        user.set(null);
        isLoading.set(false);
        return;
    }
    
    try {
        const currentUser = await getCurrentUser();
        user.set(currentUser);
    } catch (error) {
        // Only log errors if we're not on a public page
        if (!isOnPublicPage) {
            console.error('Error initializing user store:', error);
        }
        user.set(null);
    } finally {
        isLoading.set(false);
    }
};

/**
 * Update the user store
 * @param {User} userData
 */
export const updateUser = (userData: User): void => {
    user.set(userData);
};

/**
 * Clear the user store on logout
 */
export const clearUser = (): void => {
    user.set(null);
}; 