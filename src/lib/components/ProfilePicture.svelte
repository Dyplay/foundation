<script lang="ts">
  import { storage, account } from '$lib/appwrite';
  import { user, updateUser } from '$lib/stores/userStore';
  import { ID } from 'appwrite';

  let uploading = false;
  let error = '';
  let fileInput: HTMLInputElement;

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      error = 'Please upload an image file';
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error = 'File size must be less than 5MB';
      return;
    }

    try {
      uploading = true;
      error = '';

      // Upload to Appwrite storage
      const result = await storage.createFile(
        '67d48be1002a95dd5390', // Bucket ID
        ID.unique(),
        file
      );

      // Get the file URL
      const fileUrl = storage.getFileView(
        '67d48be1002a95dd5390',
        result.$id
      );

      // Update user's profile picture in Appwrite account preferences
      await account.updatePrefs({
        profilePicture: fileUrl
      });

      // Update user's profile picture in the store
      if ($user) {
        const updatedUser = { ...$user, profilePicture: fileUrl };
        updateUser(updatedUser);
      }

      console.log('Profile picture updated successfully:', fileUrl);

    } catch (e) {
      console.error('Error uploading file:', e);
      error = 'Failed to upload image. Please try again.';
    } finally {
      uploading = false;
    }
  }

  function triggerFileInput() {
    fileInput?.click();
  }
</script>

<div class="profile-picture-container">
  <div 
    class="profile-picture" 
    on:click={triggerFileInput} 
    on:keydown={(e) => e.key === 'Enter' && triggerFileInput()}
    role="button"
    tabindex="0"
  >
    {#if $user?.profilePicture}
      <img 
        src={$user.profilePicture} 
        alt="Profile" 
        class="profile-image"
      />
    {:else}
      <div class="default-avatar">
        {$user?.name?.[0]?.toUpperCase() || '?'}
      </div>
    {/if}
    <div class="overlay">
      <span class="upload-text">Change Picture</span>
    </div>
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    on:change={handleFileUpload}
    class="hidden"
  />

  {#if error}
    <p class="error-message">{error}</p>
  {/if}

  {#if uploading}
    <div class="loading">Uploading...</div>
  {/if}
</div>

<style>
  .profile-picture-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .profile-picture {
    width: 128px;
    height: 128px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    background: var(--background-card);
    transition: transform 0.2s ease;
  }

  .profile-picture:hover {
    transform: scale(1.05);
  }

  .profile-picture:hover .overlay {
    opacity: 1;
  }

  .profile-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .default-avatar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
    color: white;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .upload-text {
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .hidden {
    display: none;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
  }

  .loading {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
</style> 