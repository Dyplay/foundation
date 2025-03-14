<script lang="ts">
  import { onMount } from 'svelte';
  import { user, isLoading } from '../../lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { account } from '$lib/appwrite';
  
  let name = '';
  let email = '';
  let isUpdating = false;
  let updateSuccess = false;
  let updateError = '';
  
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
</script>

<div class="profile-container">
  {#if $isLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>
  {:else if $user}
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">
          {$user.name.charAt(0).toUpperCase()}
        </div>
        <h1 class="profile-title">Your Profile</h1>
      </div>
      
      <form on:submit|preventDefault={updateProfile} class="profile-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            bind:value={name} 
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            placeholder="Your email address"
            disabled
          />
          <p class="input-help">Email cannot be changed</p>
        </div>
        
        {#if updateError}
          <div class="error-message">{updateError}</div>
        {/if}
        
        {#if updateSuccess}
          <div class="success-message">Profile updated successfully!</div>
        {/if}
        
        <button type="submit" class="btn btn-primary profile-button" disabled={isUpdating}>
          {#if isUpdating}
            <div class="spinner"></div>
            <span>Updating...</span>
          {:else}
            Update Profile
          {/if}
        </button>
      </form>
      
      <div class="profile-info">
        <div class="info-item">
          <span class="info-label">Account ID:</span>
          <span class="info-value">{$user.$id}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email Verified:</span>
          <span class="info-value">{$user.emailVerification ? 'Yes' : 'No'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Account Status:</span>
          <span class="info-value">{$user.status ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="not-logged-in">
      <h2>Not Logged In</h2>
      <p>Please sign in to view your profile.</p>
      <a href="/auth" class="btn btn-primary">Sign In</a>
    </div>
  {/if}
</div>

<style>
  .profile-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 200px);
    padding: 2rem 1rem;
  }
  
  .profile-card {
    background-color: var(--background-card);
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 600px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  
  .profile-header {
    padding: 2rem;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border);
  }
  
  .profile-avatar {
    width: 4rem;
    height: 4rem;
    border-radius: 9999px;
    background-color: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
    margin-right: 1.5rem;
  }
  
  .profile-title {
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  .profile-form {
    padding: 2rem;
    border-bottom: 1px solid var(--border);
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .form-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    background-color: var(--background);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 0.875rem;
    transition: border-color 0.2s ease;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  }
  
  .form-group input::placeholder {
    color: var(--text-secondary);
  }
  
  .form-group input:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .input-help {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }
  
  .error-message {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    border-left: 3px solid #ef4444;
  }
  
  .success-message {
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    border-left: 3px solid #10b981;
  }
  
  .profile-button {
    width: 100%;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .profile-info {
    padding: 2rem;
  }
  
  .info-item {
    display: flex;
    margin-bottom: 1rem;
  }
  
  .info-label {
    font-weight: 500;
    width: 40%;
    color: var(--text-secondary);
  }
  
  .info-value {
    width: 60%;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  
  .loading-spinner {
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    border: 3px solid rgba(139, 92, 246, 0.3);
    border-top-color: var(--accent);
    animation: spin 1s linear infinite;
  }
  
  .spinner {
    width: 1rem;
    height: 1rem;
    border-radius: 9999px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .not-logged-in {
    text-align: center;
    padding: 2rem;
    background-color: var(--background-card);
    border-radius: 0.5rem;
    border: 1px solid var(--border);
  }
  
  .not-logged-in h2 {
    margin-bottom: 1rem;
  }
  
  .not-logged-in p {
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
  }
  
  @media (max-width: 640px) {
    .profile-card {
      box-shadow: none;
      border: none;
      background-color: transparent;
    }
    
    .profile-header,
    .profile-form,
    .profile-info {
      padding: 1.5rem 1rem;
    }
    
    .profile-avatar {
      width: 3rem;
      height: 3rem;
      font-size: 1.25rem;
      margin-right: 1rem;
    }
    
    .profile-title {
      font-size: 1.25rem;
    }
    
    .info-item {
      flex-direction: column;
    }
    
    .info-label,
    .info-value {
      width: 100%;
    }
    
    .info-value {
      margin-top: 0.25rem;
    }
  }
</style> 