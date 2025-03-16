import { databases } from '$lib/appwrite';
import { Query } from 'appwrite';

export async function load() {
    try {
        const teamMembers = await databases.listDocuments(
            'main',
            'team_members',
            [
                Query.orderDesc('$createdAt')
            ]
        );

        return {
            teamMembers: teamMembers.documents
        };
    } catch (err) {
        return {
            teamMembers: []
        };
    }
} 