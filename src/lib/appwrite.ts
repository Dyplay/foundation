import { Client, Account, Databases, ID } from 'appwrite';
import type { User } from './stores/userStore';
import { updateUser } from './stores/userStore';
import { sendVerificationEmail, simulateSendingEmail } from './email';

// Initialize the Appwrite client
const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
    .setProject('67d3f589000488385c35'); // Replace with your project ID

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);

// Database and collection IDs
const DATABASE_ID = '67d3fa9b00025dff9050'; // Replace with your database ID
const VERIFICATION_COLLECTION_ID = '67d3faa70017cd757c75'; // Replace with your collection ID

// Local storage keys
const PENDING_USER_KEY = 'pending_user';
const VERIFICATION_CODE_KEY = 'verification_code';

// Environment configuration
const IS_PRODUCTION = false; // Set to true in production environment

// Authentication functions
export const createAccount = async (email: string, password: string, name: string): Promise<any | null> => {
    try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            console.error('Not in a browser environment or localStorage is not available');
            throw new Error('Browser environment required');
        }
        
        // Generate a random 6-digit code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store user data and verification code in local storage
        const pendingUser = {
            email,
            password,
            name,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes expiry
        };
        
        // Clear any existing data first
        localStorage.removeItem(PENDING_USER_KEY);
        localStorage.removeItem(VERIFICATION_CODE_KEY);
        
        // Save new data
        localStorage.setItem(PENDING_USER_KEY, JSON.stringify(pendingUser));
        localStorage.setItem(VERIFICATION_CODE_KEY, verificationCode);
        
        // Verify data was saved correctly
        const savedUser = localStorage.getItem(PENDING_USER_KEY);
        const savedCode = localStorage.getItem(VERIFICATION_CODE_KEY);
        
        if (!savedUser || !savedCode) {
            throw new Error('Failed to save user data to localStorage');
        }
        
        // For development: Log the verification code to the console
        console.log(`Verification code for ${email}: ${verificationCode}`);
        
        // Send verification email
        if (IS_PRODUCTION) {
            // In production, send a real email
            await sendVerificationEmail(email, name, verificationCode);
        } else {
            // In development, simulate sending an email
            simulateSendingEmail(email, verificationCode, name);
        }
        
        return { email, success: true };
    } catch (error) {
        console.error('Error creating account:', error);
        throw error;
    }
};

export const login = async (email: string, password: string): Promise<any> => {
    try {
        // Updated to use createEmailPasswordSession instead of createEmailSession
        const session = await account.createEmailPasswordSession(email, password);
        
        // Get the current user after successful login
        const userData = await getCurrentUser();
        if (userData) {
            // Update the user store with the current user data
            updateUser(userData);
        }
        
        return session;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logout = async (): Promise<{}> => {
    try {
        const result = await account.deleteSession('current');
        
        // Force a page refresh after logout
        window.location.reload();
        
        return result;
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        // This will throw an error if the user is not authenticated
        const user = await account.get();
        return user as unknown as User;
    } catch (error) {
        // Don't log errors on public pages
        const publicPaths = ['/auth', '/verify'];
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isOnPublicPage = publicPaths.some(path => currentPath.startsWith(path));
        
        if (!isOnPublicPage) {
            console.error("Error getting current user:", error);
        }
        return null;
    }
};

export const isLoggedIn = async (): Promise<boolean> => {
    try {
        const user = await account.get();
        return !!user;
    } catch (error) {
        // Don't log errors on public pages
        const publicPaths = ['/auth', '/verify'];
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isOnPublicPage = publicPaths.some(path => currentPath.startsWith(path));
        
        if (!isOnPublicPage) {
            console.error('Error checking login status:', error);
        }
        return false;
    }
};

// User profile functions
export const updateName = async (name: string): Promise<User> => {
    try {
        return await account.updateName(name) as unknown as User;
    } catch (error) {
        console.error('Error updating name:', error);
        throw error;
    }
};

export const updatePassword = async (password: string, oldPassword: string): Promise<User> => {
    try {
        return await account.updatePassword(password, oldPassword) as unknown as User;
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
};

// Check if an account exists
export const checkAccountExists = async (email: string): Promise<boolean> => {
    try {
        // This is a workaround since Appwrite doesn't have a direct method to check if an account exists
        // We'll try to create a recovery session, which will fail if the account doesn't exist
        await account.createRecovery(email, 'https://example.com');
        // If we get here, the account exists
        return true;
    } catch (error: any) {
        // If the error is about the account not existing, return false
        if (error.message && error.message.includes('User with the requested email')) {
            return false;
        }
        // For any other error, assume the account might exist
        return true;
    }
};

// Email verification functions
export const sendVerificationCode = async (email: string): Promise<boolean> => {
    try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            console.error('Not in a browser environment or localStorage is not available');
            throw new Error('Browser environment required');
        }
        
        // Generate a new random 6-digit code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Get pending user from local storage
        const pendingUserJson = localStorage.getItem(PENDING_USER_KEY);
        if (!pendingUserJson) {
            throw new Error('No pending user found');
        }
        
        const pendingUser = JSON.parse(pendingUserJson);
        
        // Update the verification code in local storage
        localStorage.setItem(VERIFICATION_CODE_KEY, verificationCode);
        
        // For development: Log the verification code to the console
        console.log(`Verification code for ${email}: ${verificationCode}`);
        
        // Send verification email
        if (IS_PRODUCTION) {
            // In production, send a real email
            await sendVerificationEmail(email, pendingUser.name, verificationCode);
        } else {
            // In development, simulate sending an email
            simulateSendingEmail(email, verificationCode, pendingUser.name);
        }
        
        return true;
    } catch (error) {
        console.error('Error sending verification code:', error);
        throw error;
    }
};

export const verifyCode = async (email: string, code: string): Promise<boolean> => {
    try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            console.error('Not in a browser environment or localStorage is not available');
            throw new Error('Browser environment required');
        }
        
        // Get verification code and pending user from local storage
        const storedCode = localStorage.getItem(VERIFICATION_CODE_KEY);
        const pendingUserJson = localStorage.getItem(PENDING_USER_KEY);
        
        if (!storedCode || !pendingUserJson) {
            return false;
        }
        
        const pendingUser = JSON.parse(pendingUserJson);
        
        // Check if the code matches and the pending user hasn't expired
        if (code !== storedCode || new Date(pendingUser.expiresAt) < new Date()) {
            return false;
        }
        
        try {
            // Code is valid, create the actual account in Appwrite
            const response = await account.create(
                'unique()', 
                pendingUser.email, 
                pendingUser.password, 
                pendingUser.name
            );
            
            if (response) {
                // Don't try to login immediately - just clear the data and return success
                // The user will be redirected to the login page
                
                // Clear the pending user and verification code from local storage
                localStorage.removeItem(PENDING_USER_KEY);
                localStorage.removeItem(VERIFICATION_CODE_KEY);
                
                return true;
            }
        } catch (appwriteError: any) {
            console.error('Appwrite error during account creation:', appwriteError);
            
            // Check if the error is because the account already exists
            if (appwriteError.message && appwriteError.message.includes('already exists')) {
                // Don't try to login - just clear the data and return success
                // The user will be redirected to the login page
                
                // Clear the pending user and verification code from local storage
                localStorage.removeItem(PENDING_USER_KEY);
                localStorage.removeItem(VERIFICATION_CODE_KEY);
                
                throw new Error('This email is already registered. Please login with your credentials.');
            }
            
            throw appwriteError;
        }
        
        return false;
    } catch (error) {
        console.error('Error verifying code:', error);
        throw error;
    }
}; 