<script lang="ts">
  import { onMount } from 'svelte';
  import { user, isLoading } from '../../lib/stores/userStore';
  import { darkMode } from '../../lib/stores/themeStore';
  import { goto } from '$app/navigation';
  
  let emailNotifications = true;
  let isSaving = false;
  let saveSuccess = false;
  let saveError = '';
  
  onMount(async () => {
    // Redirect if not logged in
    if (!$isLoading && !$user) {
      goto('/auth');
    }
    
    // Load email notification settings from localStorage
    try {
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        emailNotifications = settings.emailNotifications ?? true;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  });
  
  function saveSettings() {
    isSaving = true;
    saveSuccess = false;
    saveError = '';
    
    try {
      // Get existing settings to preserve dark mode value
      const savedSettings = localStorage.getItem('user_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      
      // Update settings
      settings.emailNotifications = emailNotifications;
      
      // Save all settings back to localStorage
      localStorage.setItem('user_settings', JSON.stringify(settings));
      
      saveSuccess = true;
      setTimeout(() => {
        saveSuccess = false;
      }, 3000);
    } catch (error: any) {
      saveError = error.message || 'Failed to save settings';
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="settings-container">
  {#if $isLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading settings...</p>
    </div>
  {:else if $user}
    <div class="settings-card">
      <div class="settings-header">
        <h1 class="settings-title">Settings</h1>
        <p class="settings-subtitle">Manage your account preferences</p>
      </div>
      
      <form on:submit|preventDefault={saveSettings} class="settings-form">
        <div class="settings-section">
          <h2 class="section-title">Appearance</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <label for="dark-mode" class="setting-label">Dark Mode</label>
              <p class="setting-description">Enable dark mode for a better viewing experience in low light</p>
            </div>
            <div class="setting-control">
              <label class="toggle">
                <input type="checkbox" id="dark-mode" bind:checked={$darkMode}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h2 class="section-title">Notifications</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <label for="email-notifications" class="setting-label">Email Notifications</label>
              <p class="setting-description">Receive email notifications about account activity and updates</p>
            </div>
            <div class="setting-control">
              <label class="toggle">
                <input type="checkbox" id="email-notifications" bind:checked={emailNotifications}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h2 class="section-title">Account</h2>
          
          <div class="setting-item account-info">
            <div class="setting-info">
              <span class="setting-label">Email Address</span>
              <p class="setting-value">{$user.email}</p>
            </div>
          </div>
          
          <div class="setting-item account-info">
            <div class="setting-info">
              <span class="setting-label">Account ID</span>
              <p class="setting-value">{$user.$id}</p>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Account Management</span>
              <p class="setting-description">Update your profile information</p>
            </div>
            <div class="setting-control">
              <a href="/profile" class="btn btn-outline">Edit Profile</a>
            </div>
          </div>
        </div>
        
        {#if saveError}
          <div class="error-message">{saveError}</div>
        {/if}
        
        {#if saveSuccess}
          <div class="success-message">Settings saved successfully!</div>
        {/if}
        
        <div class="settings-actions">
          <button type="submit" class="btn btn-primary settings-button" disabled={isSaving}>
            {#if isSaving}
              <div class="spinner"></div>
              <span>Saving...</span>
            {:else}
              Save Settings
            {/if}
          </button>
        </div>
      </form>
    </div>
  {:else}
    <div class="not-logged-in">
      <h2>Not Logged In</h2>
      <p>Please sign in to view your settings.</p>
      <a href="/auth" class="btn btn-primary">Sign In</a>
    </div>
  {/if}
</div>

<style>
  .settings-container {
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
  }
  
  .settings-card {
    background-color: var(--background-card);
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 800px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  
  .settings-header {
    padding: 2rem;
    border-bottom: 1px solid var(--border);
  }
  
  .settings-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .settings-subtitle {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  
  .settings-form {
    padding: 1rem 0;
  }
  
  .settings-section {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border);
  }
  
  .section-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--accent);
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .setting-item:last-child {
    margin-bottom: 0;
  }
  
  .setting-info {
    flex: 1;
  }
  
  .setting-label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .setting-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  .setting-value {
    font-size: 0.875rem;
    font-family: monospace;
    background-color: var(--background);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    display: inline-block;
    margin-top: 0.25rem;
  }
  
  .setting-control {
    margin-left: 2rem;
  }
  
  .toggle {
    position: relative;
    display: inline-block;
    width: 3rem;
    height: 1.5rem;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--background);
    transition: .4s;
    border-radius: 1.5rem;
    border: 1px solid var(--border);
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 1.1rem;
    width: 1.1rem;
    left: 0.2rem;
    bottom: 0.15rem;
    background-color: var(--text-secondary);
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .toggle-slider {
    background-color: var(--accent);
  }
  
  input:checked + .toggle-slider:before {
    transform: translateX(1.5rem);
    background-color: white;
  }
  
  .account-info {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border);
  }
  
  .account-info:last-of-type {
    border-bottom: none;
    margin-bottom: 1.5rem;
  }
  
  .error-message {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    margin: 0 2rem 1.5rem;
    border-left: 3px solid #ef4444;
  }
  
  .success-message {
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    margin: 0 2rem 1.5rem;
    border-left: 3px solid #10b981;
  }
  
  .settings-actions {
    padding: 1.5rem 2rem 0;
    display: flex;
    justify-content: flex-end;
  }
  
  .settings-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    min-height: 50vh;
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
    width: 100%;
    max-width: 500px;
  }
  
  .not-logged-in h2 {
    margin-bottom: 1rem;
  }
  
  .not-logged-in p {
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
  }
  
  @media (max-width: 640px) {
    .settings-container {
      padding: 1rem 0;
    }
    
    .settings-card {
      box-shadow: none;
      border: none;
      background-color: transparent;
    }
    
    .settings-header,
    .settings-section {
      padding: 1.5rem 1rem;
    }
    
    .setting-item {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .setting-control {
      margin-left: 0;
      margin-top: 1rem;
      width: 100%;
    }
    
    .settings-actions {
      padding: 1.5rem 1rem 0;
    }
    
    .settings-button {
      width: 100%;
    }
    
    .error-message,
    .success-message {
      margin: 0 1rem 1.5rem;
    }
  }
</style> 