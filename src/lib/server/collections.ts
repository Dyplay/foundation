import { databases, ID } from '$lib/appwrite';

export async function createTeamMembersCollection() {
    try {
        await databases.createCollection(
            'main',
            'team_members',
            'Team Members'
        );

        // Create attributes for team member data
        await databases.createStringAttribute(
            'main',
            'team_members',
            'name',
            255,
            true
        );

        await databases.createStringAttribute(
            'main',
            'team_members',
            'role',
            100,
            true
        );

        await databases.createStringAttribute(
            'main',
            'team_members',
            'profilePicture',
            255,
            false
        );

        await databases.createStringAttribute(
            'main',
            'team_members',
            'linkedin',
            255,
            false
        );

        await databases.createStringAttribute(
            'main',
            'team_members',
            'website',
            255,
            false
        );

        await databases.createStringAttribute(
            'main',
            'team_members',
            'youtube',
            255,
            false
        );

        await databases.createStringAttribute(
            'main',
            'team_members',
            'twitter',
            255,
            false
        );

        await databases.createStringAttribute(
            'main',
            'team_members',
            'instagram',
            255,
            false
        );

        await databases.createStringAttribute(
            'main',
            'team_members',
            'telegram',
            255,
            false
        );

        // Create indexes
        await databases.createIndex(
            'main',
            'team_members',
            'name_index',
            'key',
            ['name']
        );

        console.log('Team members collection created successfully');
    } catch (error) {
        console.error('Error creating team members collection:', error);
    }
} 