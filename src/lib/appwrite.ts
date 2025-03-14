import { Client, Account, Databases, Storage, ID } from 'appwrite';
import type { User } from './stores/userStore';
import { updateUser } from './stores/userStore';
import { sendVerificationEmail } from './emailService';

// Initialize the Appwrite client
export const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67d3f589000488385c35');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and collection IDs
const DATABASE_ID = '67d3fa9b00025dff9050'; // Replace with your database ID
const VERIFICATION_COLLECTION_ID = '67d3faa70017cd757c75'; // Replace with your collection ID

// Local storage keys
const PENDING_USER_KEY = 'pending_user';
const VERIFICATION_CODE_KEY = 'verification_code';

// Environment configuration
const IS_PRODUCTION = false; // Set to true in production environment

// Type definitions
interface UserAccount {
    email: string;
    password: string;
    name: string;
}

interface SignInCredentials {
    email: string;
    password: string;
}

// Authentication functions
export const createUserAccount = async ({ email, password, name }: UserAccount) => {
    try {
        // Instead of creating account, store details in localStorage for later
        const pendingUser = {
            email,
            password,
            name,
            expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
        };
        
        localStorage.setItem(PENDING_USER_KEY, JSON.stringify(pendingUser));
        
        // Send verification email
        await sendVerificationCode(email);
        
        return { success: true, email };
    } catch (error) {
        console.error("Error initiating account creation:", error);
        throw error;
    }
};

export const signInAccount = async ({ email, password }: SignInCredentials) => {
    try {
        // Use email and password directly without userId
        const session = await account.createEmailPasswordSession(email, password);
        window.location.href = '/';
        return session;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        return currentAccount;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
};

export const signOutAccount = async () => {
    try {
        const session = await account.deleteSession('current');
        window.location.href = '/';
        return session;
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const checkUserExists = async (email: string) => {
    try {
        // Try to create a session - this will fail if user doesn't exist
        await account.createSession(email, 'dummy-password');
        return true;
    } catch (error: any) {
        if (error.code === 401) {
            // User exists but wrong password
            return true;
        }
        // Any other error means user doesn't exist
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
        
        // Send verification email using Resend
        await sendVerificationEmail(email, pendingUser.name, verificationCode);
        
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
            // Change 'unique()' string to ID.unique()
            const userId = ID.unique(); // Generate proper userId using Appwrite's ID utility
            const response = await account.create(
                userId,  // Use the generated userId instead of 'unique()'
                pendingUser.email,
                pendingUser.password,
                pendingUser.name
            );
            
            if (response) {
                localStorage.removeItem(PENDING_USER_KEY);
                localStorage.removeItem(VERIFICATION_CODE_KEY);
                return true;
            }
        } catch (appwriteError: any) {
            console.error('Appwrite error during account creation:', appwriteError);
            throw appwriteError;
        }
        
        return false;
    } catch (error) {
        console.error('Error verifying code:', error);
        throw error;
    }
}; 