import { writable } from 'svelte/store';
import { getCurrentUser } from '../appwrite';

/**
 * @typedef {Object} User
 * @property {string} $id
 * @property {string} name
 * @property {string} email
 * @property {boolean} emailVerification
 * @property {boolean} status
 * @property {Object.<string, any>} prefs
 */

/** @type {import('svelte/store').Writable<User|null>} */
export const user = writable(null);
/** @type {import('svelte/store').Writable<boolean>} */
export const isLoading = writable(true);
/** @type {import('svelte/store').Writable<boolean>} */
export const isPublicPage = writable(false);

/**
 * Initialize the user store
 * @returns {Promise<void>}
 */
export const initUserStore = async () => {
    isLoading.set(true);
    
    // Check if we're on a public page (auth, verify, etc.)
    const publicPaths = ['/auth', '/verify'];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isOnPublicPage = publicPaths.some(path => currentPath.startsWith(path));
    
    isPublicPage.set(isOnPublicPage);
    
    try {
        const currentUser = await getCurrentUser();
        user.set(currentUser);
    } catch (error) {
        console.error('Error initializing user store:', error);
        user.set(null);
        
        // Don't show errors in console for public pages
        if (isOnPublicPage) {
            console.log('User not authenticated on public page, this is expected');
        }
    } finally {
        isLoading.set(false);
    }
};

/**
 * Update the user store
 * @param {User} userData
 */
export const updateUser = (userData) => {
    user.set(userData);
};

/**
 * Clear the user store on logout
 */
export const clearUser = () => {
    user.set(null);
}; 