<script lang="ts">
  import { onMount } from 'svelte';
  import { user, isLoading } from '../../lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { account } from '$lib/appwrite';
  import ProfilePicture from '$lib/components/ProfilePicture.svelte';
  import { updateName } from '$lib/appwrite';

  let name = '';
  let email = '';
  let isUpdating = false;
  let updateSuccess = false;
  let updateError = '';
  let isEditing = false;
  let newName = '';

  onMount(async () => {
    // Redirect if not logged in
    if (!$isLoading && !$user) {
      goto('/auth');
    } else if ($user) {
      name = $user.name;
      email = $user.email;
    }
  });
  
  async function updateProfile() {
    if (!$user) return;
    
    isUpdating = true;
    updateSuccess = false;
    updateError = '';
    
    try {
      await account.updateName(name);
      
      // Update local user data
      $user = { ...$user, name };
      
      updateSuccess = true;
      setTimeout(() => {
        updateSuccess = false;
      }, 3000);
    } catch (error: any) {
      updateError = error.message || 'Failed to update profile';
    } finally {
      isUpdating = false;
    }
  }

  async function handleUpdateName() {
    try {
      if (!newName.trim()) return;
      await updateName(newName);
      isEditing = false;
      updateError = '';
    } catch (error) {
      updateError = 'Failed to update name. Please try again.';
    }
  }

  function startEditing() {
    if ($user) {
      newName = $user.name;
      isEditing = true;
    }
  }
</script>

<div class="page-container">
  <div class="profile-container">
    <div class="profile-header">
      <h1>Your Profile</h1>
      <p class="subtitle">Manage your account information</p>
    </div>

    <div class="profile-content">
      <div class="profile-section main-info">
        <ProfilePicture />
        
        <div class="user-info">
          {#if isEditing}
            <div class="edit-name-form">
              <input
                type="text"
                bind:value={newName}
                placeholder="Enter new name"
                class="name-input"
              />
              <div class="button-group">
                <button class="btn secondary" on:click={() => isEditing = false}>Cancel</button>
                <button class="btn primary" on:click={handleUpdateName}>Save</button>
              </div>
              {#if updateError}
                <p class="error-message">{updateError}</p>
              {/if}
            </div>
          {:else if $user}
            <div class="name-display">
              <h2>{$user.name}</h2>
              <button class="btn-icon" on:click={startEditing}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              </button>
            </div>
          {/if}
          {#if $user}
            <p class="email">{$user.email}</p>
          {/if}
        </div>
      </div>

      <div class="profile-section account-details">
        <h3>Account Details</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Account ID</span>
            <span class="detail-value">{$user?.$id || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email Status</span>
            <span class="detail-value status">
              <span class="status-dot {$user?.emailVerification ? 'verified' : 'unverified'}"></span>
              {$user?.emailVerification ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Account Status</span>
            <span class="detail-value status">
              <span class="status-dot active"></span>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .page-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .profile-container {
    background: var(--background-card);
    border-radius: 1.5rem;
    padding: 2.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .profile-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: var(--text-secondary);
    margin-top: 0.5rem;
    font-size: 1.125rem;
  }

  .profile-content {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .profile-section {
    padding: 2rem;
    background: var(--background);
    border-radius: 1rem;
    border: 1px solid var(--border);
  }

  .main-info {
    display: flex;
    gap: 2.5rem;
    align-items: center;
  }

  .user-info {
    flex: 1;
  }

  .name-display {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  h2 {
    font-size: 1.875rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .email {
    color: var(--text-secondary);
    font-size: 1.125rem;
    margin: 0.5rem 0 0 0;
  }

  .btn-icon {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    border-radius: 0.5rem;
    transition: all 0.2s;
  }

  .btn-icon:hover {
    color: var(--accent);
    background: var(--background-hover);
  }

  .edit-name-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .name-input {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text-primary);
    font-size: 1rem;
    width: 100%;
    max-width: 300px;
  }

  .button-group {
    display: flex;
    gap: 1rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .primary {
    background: var(--accent);
    color: white;
    border: none;
  }

  .primary:hover {
    opacity: 0.9;
  }

  .secondary {
    background: var(--background);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .secondary:hover {
    background: var(--background-hover);
  }

  .account-details h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: var(--text-primary);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .detail-value {
    font-size: 1rem;
    color: var(--text-primary);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-dot.active {
    background: #22c55e;
  }

  .status-dot.verified {
    background: #22c55e;
  }

  .status-dot.unverified {
    background: #f59e0b;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .page-container {
      padding: 1rem;
    }

    .profile-container {
      padding: 1.5rem;
    }

    .main-info {
      flex-direction: column;
      text-align: center;
    }

    .name-display {
      justify-content: center;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 