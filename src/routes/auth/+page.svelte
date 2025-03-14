<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { createUserAccount, signInAccount as login, getCurrentUser as isLoggedIn, checkUserExists as checkAccountExists } from '$lib/appwrite';
  import { isPublicPage } from '$lib/stores/userStore';

  // Form state
  let isLoginForm = true;
  let email = '';
  let password = '';
  let confirmPassword = '';
  let name = '';
  let error = '';
  let success = '';
  let loading = false;
  let checkingLoginStatus = true;
  let showPassword = false;
  let showConfirmPassword = false;
  let passwordsMatch = true;

  // Check URL parameters for form state
  onMount(async () => {
    // Mark this as a public page
    isPublicPage.set(true);

    try {
      // Check if user is already logged in
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        // If already logged in, redirect to home
        goto('/');
        return;
      }
    } catch (err) {
      // Don't log errors on the auth page
    } finally {
      checkingLoginStatus = false;
    }

    // Check URL parameters
    const url = new URL(window.location.href);
    const verified = url.searchParams.get('verified');
    
    if (verified === 'true') {
      success = 'Email verified successfully! Please log in.';
      isLoginForm = true;
    }
  });

  // Check if passwords match
  function checkPasswordsMatch() {
    if (!isLoginForm && password && confirmPassword) {
      passwordsMatch = password === confirmPassword;
    } else {
      passwordsMatch = true;
    }
  }

  // Toggle password visibility
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  // Toggle confirm password visibility
  function toggleConfirmPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }

  async function handleSubmit() {
    error = '';
    success = '';
    
    // Check if passwords match for signup
    if (!isLoginForm) {
      if (password !== confirmPassword) {
        error = 'Passwords do not match';
        return;
      }
    }
    
    loading = true;

    try {
      if (isLoginForm) {
        // Handle login
        await login({ email, password });
        success = 'Login successful! Redirecting...';
        setTimeout(() => {
          goto('/');
        }, 1000);
      } else {
        // Check if email already exists before creating account
        const exists = await checkAccountExists(email);
        if (exists) {
          error = 'An account with this email already exists. Please log in.';
          loading = false;
          return;
        }

        // Handle registration
        await createUserAccount({ email, password, name });
        success = 'Account created! Please check your email for verification code.';
        setTimeout(() => {
          goto('/verify');
        }, 2000);
      }
    } catch (err: any) {
      error = err.message || 'An error occurred';
    } finally {
      loading = false;
    }
  }

  function toggleForm() {
    isLoginForm = !isLoginForm;
    error = '';
    success = '';
    password = '';
    confirmPassword = '';
    showPassword = false;
    showConfirmPassword = false;
  }
</script>

<svelte:head>
  <title>{isLoginForm ? 'Login' : 'Create Account'} | EonfluxTech</title>
</svelte:head>

<div class="auth-container">
  {#if checkingLoginStatus}
    <div class="loading-spinner"></div>
    <p>Checking login status...</p>
  {:else}
    <div class="auth-card">
      <h1>{isLoginForm ? 'Login' : 'Create Account'}</h1>
      
      {#if !isLoginForm}
        <p class="subtitle">Create a new account to get started with our platform.</p>
      {/if}
      
      {#if error}
        <div class="error">{error}</div>
      {/if}
      
      {#if success}
        <div class="success">{success}</div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit}>
        {#if !isLoginForm}
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              bind:value={name}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>
        {/if}
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-container">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              bind:value={password}
              on:input={checkPasswordsMatch}
              placeholder="Enter your password"
              required
              minlength="8"
              disabled={loading}
              autocomplete={isLoginForm ? "current-password" : "new-password"}
            />
            <button 
              type="button" 
              class="password-toggle" 
              on:click={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon">
                {#if showPassword}
                  <!-- Eye with slash (hidden) -->
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                {:else}
                  <!-- Eye (visible) -->
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                {/if}
              </svg>
            </button>
          </div>
        </div>
        
        {#if !isLoginForm}
          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <div class="password-input-container">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                bind:value={confirmPassword}
                on:input={checkPasswordsMatch}
                placeholder="Confirm your password"
                required
                minlength="8"
                disabled={loading}
                class={!passwordsMatch && confirmPassword ? "password-mismatch" : ""}
                autocomplete="new-password"
              />
              <button 
                type="button" 
                class="password-toggle" 
                on:click={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon">
                  {#if showConfirmPassword}
                    <!-- Eye with slash (hidden) -->
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  {:else}
                    <!-- Eye (visible) -->
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  {/if}
                </svg>
              </button>
            </div>
            {#if !passwordsMatch && confirmPassword}
              <div class="password-mismatch-message">Passwords do not match</div>
            {/if}
          </div>
        {/if}
        
        <button type="submit" class="button primary" disabled={loading || (!isLoginForm && !passwordsMatch)}>
          {#if loading}
            <div class="loading-spinner small"></div>
            {isLoginForm ? 'Logging in...' : 'Creating Account...'}
          {:else}
            {isLoginForm ? 'Login' : 'Create Account'}
          {/if}
        </button>
      </form>
      
      <div class="toggle-form">
        <p>
          {isLoginForm ? "Don't have an account?" : "Already have an account?"}
          <button class="link-button" on:click={toggleForm} disabled={loading}>
            {isLoginForm ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .auth-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background-color: #0f172a;
    color: #e0e0e0;
  }
  
  .auth-card {
    background: #1a2234;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    padding: 2rem;
    width: 100%;
    max-width: 480px;
    animation: fadeIn 0.3s ease-in-out;
  }
  
  h1 {
    margin-bottom: 0.5rem;
    text-align: center;
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .subtitle {
    text-align: center;
    color: #94a3b8;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
    animation: slideUp 0.3s ease-in-out;
    animation-fill-mode: both;
  }
  
  .form-group:nth-child(1) {
    animation-delay: 0.1s;
  }
  
  .form-group:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .form-group:nth-child(3) {
    animation-delay: 0.3s;
  }
  
  .form-group:nth-child(4) {
    animation-delay: 0.4s;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #94a3b8;
    font-size: 0.875rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #2d3748;
    border-radius: 4px;
    font-size: 0.875rem;
    background-color: #1e293b;
    color: #ffffff;
    transition: all 0.2s ease;
  }
  
  input::placeholder {
    color: #64748b;
  }
  
  input:focus {
    border-color: #7c3aed;
    outline: none;
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
  }
  
  .password-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: color 0.2s ease;
  }
  
  .password-toggle:hover {
    color: #94a3b8;
  }
  
  .eye-icon {
    width: 18px;
    height: 18px;
  }
  
  .password-mismatch {
    border-color: #ef4444;
  }
  
  .password-mismatch-message {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.5rem;
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    animation: fadeIn 0.5s ease-in-out;
    animation-delay: 0.4s;
    animation-fill-mode: both;
  }
  
  .button.primary {
    background-color: #7c3aed;
    color: white;
    width: 100%;
  }
  
  .button.primary:hover {
    background-color: #6d28d9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .button.secondary {
    background-color: #1e293b;
    color: #94a3b8;
  }
  
  .button.secondary:hover {
    background-color: #2d3748;
    transform: translateY(-1px);
  }
  
  .button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  .error {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid rgba(239, 68, 68, 0.2);
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    font-size: 0.875rem;
  }
  
  .success {
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid rgba(16, 185, 129, 0.2);
    animation: pulse 2s infinite;
    font-size: 0.875rem;
  }
  
  .toggle-form {
    margin-top: 1.5rem;
    text-align: center;
    animation: fadeIn 0.5s ease-in-out;
    animation-delay: 0.5s;
    animation-fill-mode: both;
    font-size: 0.875rem;
    color: #94a3b8;
  }
  
  .link-button {
    background: none;
    border: none;
    color: #7c3aed;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  
  .link-button:hover {
    color: #8b5cf6;
    text-decoration: underline;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(124, 58, 237, 0.1);
    border-left-color: #7c3aed;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  .loading-spinner.small {
    width: 16px;
    height: 16px;
    border-width: 2px;
    margin: 0 8px 0 0;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shake {
    10%, 90% {
      transform: translateX(-1px);
    }
    20%, 80% {
      transform: translateX(2px);
    }
    30%, 50%, 70% {
      transform: translateX(-4px);
    }
    40%, 60% {
      transform: translateX(4px);
    }
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }
</style> 