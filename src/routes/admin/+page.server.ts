import { error, redirect } from '@sveltejs/kit';
import { databases } from '$lib/appwrite';
import { Query } from 'appwrite';

const ADMIN_USER_ID = 'usrm8a7qi1lhqqh6';

export async function load({ locals }) {
    const user = locals.user;

    if (!user || user.$id !== ADMIN_USER_ID) {
        throw redirect(302, '/auth');
    }

    try {
        // Get project usage statistics
        // Note: This would need to be implemented with actual Appwrite admin SDK
        const stats = {
            users: 0,
            storage: 0,
            databases: 0,
            functions: 0
        };

        // Get team members
        const teamMembers = await databases.listDocuments(
            '67d3fa9b00025dff9050',
            'our_team_members',
            [
                Query.orderDesc('$createdAt')
            ]
        );

        return {
            stats,
            teamMembers: teamMembers.documents
        };
    } catch (err) {
        throw error(500, 'Failed to load admin dashboard data');
    }
} 