<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { verifyCode, sendVerificationCode, getCurrentUser } from '$lib/appwrite';
  import { isPublicPage } from '$lib/stores/userStore';
  
  // State variables
  let verificationCode = '';
  let isVerifying = false;
  let error = '';
  let success = '';
  let email = '';
  let isResending = false;
  let testCode = '';
  let pendingUserData = '';
  let verificationCodeData = '';
  let noPendingUser = false;
  let devMessage = '';
  let isLoading = true;
  let checkingLoginStatus = true;
  let message = '';
  
  // Load pending user data from localStorage
  function loadPendingUserData() {
    try {
      // Get data from localStorage
      const pendingUserJson = localStorage.getItem('pending_user');
      const storedCode = localStorage.getItem('verification_code');
      
      // Update debug information
      pendingUserData = pendingUserJson || 'Not found';
      verificationCodeData = storedCode || 'Not found';
      
      console.log('Pending user in localStorage:', pendingUserJson ? 'Yes' : 'No');
      
      if (!pendingUserJson) {
        console.log('No pending user found, showing message');
        noPendingUser = true;
        return false;
      }
      
      try {
        const pendingUser = JSON.parse(pendingUserJson);
        console.log('Pending user parsed:', pendingUser);
        email = pendingUser.email;
        
        // Check if the pending user has expired
        const expiryDate = new Date(pendingUser.expiresAt);
        const now = new Date();
        console.log('Expiry date:', expiryDate);
        console.log('Current date:', now);
        console.log('Is expired:', expiryDate < now);
        
        if (expiryDate < now) {
          console.log('Pending user has expired, showing message');
          noPendingUser = true;
          localStorage.removeItem('pending_user');
          localStorage.removeItem('verification_code');
          return false;
        }
        
        // For development: Show verification code
        if (storedCode) {
          testCode = storedCode;
          console.log(`Verification code for ${email}: ${storedCode}`);
          devMessage = `Development: The verification code is ${storedCode}`;
        }
        
        return true;
      } catch (err) {
        console.error('Error parsing pending user:', err);
        noPendingUser = true;
        localStorage.removeItem('pending_user');
        localStorage.removeItem('verification_code');
        return false;
      }
    } catch (err) {
      console.error('Error in loadPendingUserData:', err);
      noPendingUser = true;
      return false;
    }
  }
  
  onMount(async () => {
    isPublicPage.set(true); // Mark this as a public page
    
    try {
        // Check if user is already logged in
        const user = await getCurrentUser();
        if (user) {
            // If already logged in, redirect to home
            goto('/');
            return;
        }
    } catch (err) {
        // Don't log errors on the verify page
    } finally {
        checkingLoginStatus = false;
    }

    // Get the stored pending user
    const pendingUserJson = localStorage.getItem('pending_user');
    if (!pendingUserJson) {
        goto('/auth');
        return;
    }
    
    const pendingUser = JSON.parse(pendingUserJson);
    email = pendingUser.email;
    
    message = `We've sent a verification code to ${email}. Please check your email and enter the code below to complete your registration.`;
  });
  
  async function handleSubmit() {
    if (!verificationCode) {
      error = 'Please enter the verification code';
      return;
    }

    error = '';
    success = '';
    isVerifying = true;

    try {
      const result = await verifyCode(email, verificationCode);
      if (result) {
        success = 'Email verified successfully! Redirecting to login...';
        setTimeout(() => {
          goto('/auth?verified=true');
        }, 2000);
      } else {
        error = 'Invalid verification code. Please try again.';
      }
    } catch (err: any) {
      error = err.message || 'An error occurred during verification';
    } finally {
      isVerifying = false;
    }
  }
  
  async function handleResendCode() {
    error = '';
    success = '';
    isResending = true;
    
    try {
      await sendVerificationCode(email);
      success = 'Verification code resent! Please check your email.';
    } catch (err: any) {
      error = err.message || 'Failed to resend verification code';
    } finally {
      isResending = false;
    }
  }
  
  function createTestData() {
    const testEmail = 'test@example.com';
    const testUser = {
      email: testEmail,
      password: 'password123',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
    const testVerificationCode = '123456';
    
    // Save to localStorage
    localStorage.setItem('pending_user', JSON.stringify(testUser));
    localStorage.setItem('verification_code', testVerificationCode);
    
    // Reload the page to show the verification form
    window.location.reload();
  }
</script>

<svelte:head>
  <title>Verify Your Email</title>
</svelte:head>

<div class="verify-container">
  {#if checkingLoginStatus}
    <div class="loading-spinner"></div>
    <p>Checking login status...</p>
  {:else if noPendingUser}
    <div class="error-container">
      <h1>Verification Error</h1>
      <p>{error}</p>
      <a href="/auth" class="button">Back to Sign Up</a>
    </div>
  {:else}
    <div class="verify-card">
      <h1>Verify Your Email</h1>
      
      {#if message}
        <div class="message">
          {message}
        </div>
      {/if}
      
      {#if error}
        <div class="error">
          {error}
        </div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="verification-code">Verification Code</label>
          <input
            id="verification-code"
            type="text"
            bind:value={verificationCode}
            placeholder="Enter 6-digit code"
            required
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
          />
        </div>
        
        <button type="submit" class="button primary" disabled={isVerifying}>
          {#if isVerifying}
            <div class="loading-spinner small"></div> Verifying...
          {:else}
            Verify Email
          {/if}
        </button>
      </form>
      
      <div class="info-box">
        <p>Didn't receive the email? Check your spam folder or</p>
        <button class="resend-button" on:click={() => window.location.reload()}>
          Resend Verification Email
        </button>
      </div>
      
      <div class="back-link">
        <a href="/auth">Back to Sign Up</a>
      </div>
    </div>
  {/if}
</div>

<style>
  .verify-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 64px);
    padding: 2rem;
  }
  
  .verify-card {
    background: #1e1e1e;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    padding: 2rem;
    width: 100%;
    max-width: 480px;
    text-align: center;
    animation: fadeIn 0.3s ease-in-out;
    color: #e0e0e0;
  }
  
  h1 {
    margin-bottom: 1rem;
    color: #ffffff;
    animation: slideDown 0.3s ease-in-out;
  }
  
  p {
    animation: fadeIn 0.5s ease-in-out;
    animation-delay: 0.1s;
    animation-fill-mode: both;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
    text-align: left;
    animation: slideUp 0.3s ease-in-out;
    animation-delay: 0.2s;
    animation-fill-mode: both;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #d0d0d0;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #444;
    border-radius: 4px;
    font-size: 1rem;
    letter-spacing: 0.1em;
    text-align: center;
    background-color: #2a2a2a;
    color: #ffffff;
    transition: all 0.2s ease;
  }
  
  input:focus {
    border-color: #4f46e5;
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
  }
  
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    animation: fadeIn 0.5s ease-in-out;
    animation-delay: 0.3s;
    animation-fill-mode: both;
  }
  
  .button.primary {
    background-color: #4f46e5;
    color: white;
    width: 100%;
  }
  
  .button.primary:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .button.secondary {
    background-color: #2a2a2a;
    color: #d0d0d0;
  }
  
  .button.secondary:hover {
    background-color: #333;
    transform: translateY(-2px);
  }
  
  .button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  .error {
    background-color: rgba(220, 38, 38, 0.2);
    color: #ef4444;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid rgba(220, 38, 38, 0.3);
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
  
  .success {
    background-color: rgba(16, 185, 129, 0.2);
    color: #10b981;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid rgba(16, 185, 129, 0.3);
    animation: pulse 2s infinite;
  }
  
  .resend-container {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #444;
    animation: fadeIn 0.5s ease-in-out;
    animation-delay: 0.4s;
    animation-fill-mode: both;
  }
  
  .back-link {
    margin-top: 1.5rem;
    animation: fadeIn 0.5s ease-in-out;
    animation-delay: 0.5s;
    animation-fill-mode: both;
  }
  
  .back-link a {
    color: #6366f1;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .back-link a:hover {
    color: #818cf8;
    text-decoration: underline;
  }
  
  .error-container {
    background: #1e1e1e;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    padding: 2rem;
    width: 100%;
    max-width: 480px;
    text-align: center;
    animation: fadeIn 0.3s ease-in-out;
    color: #e0e0e0;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(79, 70, 229, 0.1);
    border-left-color: #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  .loading-spinner.small {
    width: 20px;
    height: 20px;
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
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
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
  
  .message {
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  
  .info-box {
    margin-top: 2rem;
    text-align: center;
    color: #94a3b8;
    font-size: 0.875rem;
  }
  
  .resend-button {
    background: none;
    border: none;
    color: #7c3aed;
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    transition: color 0.2s ease;
  }
  
  .resend-button:hover {
    color: #6d28d9;
    text-decoration: underline;
  }
</style> 