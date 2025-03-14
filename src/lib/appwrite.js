import { Client, Account, Databases, Storage, ID } from 'appwrite';

// Initialize the Appwrite client
export const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Make sure this is the correct endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''); // Ensure your project ID is set correctly

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Authentication functions
export const createUserAccount = async ({ email, password, name }) => {
    try {
        // Create a new account
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            name
        );

        if (!newAccount) throw new Error('Account creation failed');

        // Sign in the user immediately after account creation
        const session = await signInAccount({ email, password });

        return session;
    } catch (error) {
        console.error("Error creating account:", error);
        throw error;
    }
};

export const signInAccount = async ({ email, password }) => {
    try {
        // Create a new email session
        const session = await account.createEmailSession(email, password);
        return session;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        // Get the current user
        const currentAccount = await account.get();
        return currentAccount;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
};

export const signOutAccount = async () => {
    try {
        // Delete all sessions
        const session = await account.deleteSession('current');
        return session;
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

// Function to check if user exists
export const checkUserExists = async (email) => {
    try {
        // This is a workaround since Appwrite doesn't have a direct "check if user exists" API
        // We'll try to create a password recovery and catch the error if the user doesn't exist
        await account.createRecovery(email, 'https://yourapp.com/reset-password');
        return true; // If no error, user exists
    } catch (error) {
        if (error.code === 404) {
            return false; // User doesn't exist
        }
        console.error("Error checking if user exists:", error);
        throw error;
    }
}; 