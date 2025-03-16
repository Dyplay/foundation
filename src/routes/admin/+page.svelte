<!-- Admin Dashboard -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import { databases, storage } from '$lib/appwrite';
  import { ID } from 'appwrite';

  interface PageData {
    stats: { users: number; storage: number; databases: number; functions: number };
    teamMembers: Array<{
      $id: string;
      name: string;
      role: string;
      profilePicture?: string;
      linkedin?: string;
      website?: string;
      youtube?: string;
      twitter?: string;
      instagram?: string;
      telegram?: string;
    }>;
  }

  export let data: PageData;

  let teamMembers = data.teamMembers;
  let stats = data.stats;

  // New team member form data
  let newMember = {
    name: '',
    role: '',
    profilePicture: null as File | null,
    linkedin: '',
    website: '',
    youtube: '',
    twitter: '',
    instagram: '',
    telegram: ''
  };

  let error = '';
  let success = '';

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      newMember.profilePicture = input.files[0];
    }
  }

  async function addTeamMember() {
    try {
      error = '';
      success = '';

      // Upload profile picture if provided
      let profilePictureUrl = '';
      if (newMember.profilePicture) {
        const file = await storage.createFile(
          '67d622720002cf0a76ff',
          ID.unique(),
          newMember.profilePicture
        );
        profilePictureUrl = storage.getFileView('67d622720002cf0a76ff', file.$id).href;
      }

      // Create team member document
      const member = await databases.createDocument(
        '67d3fa9b00025dff9050',
        'our_team_members',
        ID.unique(),
        {
          name: newMember.name,
          role: newMember.role,
          profilePicture: profilePictureUrl,
          linkedin: newMember.linkedin,
          website: newMember.website,
          youtube: newMember.youtube,
          twitter: newMember.twitter,
          instagram: newMember.instagram,
          telegram: newMember.telegram
        }
      );

      teamMembers = [...teamMembers, member];
      success = 'Team member added successfully!';

      // Reset form
      newMember = {
        name: '',
        role: '',
        profilePicture: null,
        linkedin: '',
        website: '',
        youtube: '',
        twitter: '',
        instagram: '',
        telegram: ''
      };
    } catch (err) {
      error = 'Failed to add team member';
      console.error(err);
    }
  }

  async function deleteTeamMember(id: string) {
    try {
      await databases.deleteDocument('main', 'team_members', id);
      teamMembers = teamMembers.filter(member => member.$id !== id);
      success = 'Team member deleted successfully!';
    } catch (err) {
      error = 'Failed to delete team member';
      console.error(err);
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

  <!-- Project Stats -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-2">Users</h3>
      <p class="text-3xl font-bold">{stats.users}</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-2">Storage Used</h3>
      <p class="text-3xl font-bold">{stats.storage} MB</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-2">Database Documents</h3>
      <p class="text-3xl font-bold">{stats.databases}</p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-2">Functions</h3>
      <p class="text-3xl font-bold">{stats.functions}</p>
    </div>
  </div>

  <!-- Team Members Section -->
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-12">
    <h2 class="text-2xl font-bold mb-6">Team Members</h2>

    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" transition:fade>
        {error}
      </div>
    {/if}

    {#if success}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" transition:fade>
        {success}
      </div>
    {/if}

    <!-- Add Team Member Form -->
    <form on:submit|preventDefault={addTeamMember} class="mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block mb-2">Name</label>
          <input type="text" bind:value={newMember.name} required class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block mb-2">Role</label>
          <input type="text" bind:value={newMember.role} required class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block mb-2">Profile Picture</label>
          <input type="file" accept="image/*" on:change={handleFileUpload} class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block mb-2">LinkedIn</label>
          <input type="url" bind:value={newMember.linkedin} class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block mb-2">Website</label>
          <input type="url" bind:value={newMember.website} class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block mb-2">YouTube</label>
          <input type="url" bind:value={newMember.youtube} class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block mb-2">Twitter</label>
          <input type="url" bind:value={newMember.twitter} class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block mb-2">Instagram</label>
          <input type="url" bind:value={newMember.instagram} class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block mb-2">Telegram</label>
          <input type="url" bind:value={newMember.telegram} class="w-full p-2 border rounded" />
        </div>
      </div>
      <button type="submit" class="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
        Add Team Member
      </button>
    </form>

    <!-- Team Members List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each teamMembers as member (member.$id)}
        <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg" transition:fade>
          <div class="flex items-center mb-4">
            {#if member.profilePicture}
              <img src={member.profilePicture} alt={member.name} class="w-16 h-16 rounded-full object-cover mr-4" />
            {:else}
              <div class="w-16 h-16 rounded-full bg-gray-200 mr-4"></div>
            {/if}
            <div>
              <h3 class="text-lg font-semibold">{member.name}</h3>
              <p class="text-gray-600 dark:text-gray-300">{member.role}</p>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2 mb-4">
            {#if member.linkedin}
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600">
                LinkedIn
              </a>
            {/if}
            {#if member.website}
              <a href={member.website} target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600">
                Website
              </a>
            {/if}
            {#if member.youtube}
              <a href={member.youtube} target="_blank" rel="noopener noreferrer" class="text-red-500 hover:text-red-600">
                YouTube
              </a>
            {/if}
            {#if member.twitter}
              <a href={member.twitter} target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-500">
                Twitter
              </a>
            {/if}
            {#if member.instagram}
              <a href={member.instagram} target="_blank" rel="noopener noreferrer" class="text-pink-500 hover:text-pink-600">
                Instagram
              </a>
            {/if}
            {#if member.telegram}
              <a href={member.telegram} target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600">
                Telegram
              </a>
            {/if}
          </div>

          <button 
            on:click={() => deleteTeamMember(member.$id)}
            class="text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      {/each}
    </div>
  </div>
</div> 