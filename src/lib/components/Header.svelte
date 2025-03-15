<script lang="ts">
  import { onMount } from 'svelte';
  import { user, isLoading, initUserStore, isPublicPage } from '../../lib/stores/userStore';
  import { darkMode } from '../../lib/stores/themeStore';
  import { signOutAccount as logout } from '$lib/appwrite';
  
  export let companyName: string;
  
  let isSearchOpen = false;
  let searchQuery = '';
  let isMenuOpen = false;
  let isUserMenuOpen = false;
  
  // Update logo source when theme changes
  $: logoSrc = $darkMode ? '/logo.png' : '/logo_whitemode.png';
  
  // Create a style element for dynamic logo updates
  let styleElement: HTMLStyleElement;
  
  onMount(() => {
    // Create and append style element
    styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    
    // Initialize the user store
    initUserStore();
    
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.querySelector('.user-menu-container');
      if (isUserMenuOpen && userMenu && !userMenu.contains(event.target as Node)) {
        isUserMenuOpen = false;
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    // Cleanup on component destroy
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
      document.removeEventListener('click', handleClickOutside);
    };
  });
  
  // Update style when logo source changes
  $: if (styleElement) {
    styleElement.textContent = `
      .logo-image {
        content: url("${logoSrc}") !important;
      }
    `;
  }
  
  function toggleSearch() {
    isSearchOpen = !isSearchOpen;
    if (isSearchOpen) {
      // Focus the search input after animation completes
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 300);
    } else {
      searchQuery = '';
    }
  }
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
  
  function toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    isUserMenuOpen = !isUserMenuOpen;
  }
  
  function handleSearch(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      toggleSearch();
    } else if (e.key === 'Enter' && searchQuery.trim()) {
      // Perform search action
      console.log('Searching for:', searchQuery);
      // You would typically redirect to search results page or show results
    }
  }
  
  const handleLogout = async () => {
    try {
      await logout();
      // Optionally, you can show a success message or redirect
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle the error (e.g., show a notification)
    }
  };
</script>

<header>
  <div class="container">
    <div class="navbar">
      <a href="/" class="logo">
        <img src={logoSrc} alt="{companyName} Logo" class="logo-image" />
      </a>
      
      <button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
      
      <div class="nav-container {isMenuOpen ? 'open' : ''}">
        <div class="nav-links">
          <a href="#products" class="nav-link">Products</a>
          <a href="#about" class="nav-link">About</a>
          <a href="#projects" class="nav-link">Projects</a>
          <a href="https://github.com" class="nav-link">GitHub</a>
        </div>
        
        <div class="actions">
          <div class="search-container {isSearchOpen ? 'open' : ''}">
            {#if !isSearchOpen}
              <button on:click={toggleSearch} class="search-icon" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            {/if}
            
            <div class="search-input-container">
              <input 
                type="text" 
                id="search-input"
                placeholder="Search..." 
                class="search-input"
                bind:value={searchQuery}
                on:keydown={handleSearch}
              />
              {#if isSearchOpen}
                <button on:click={toggleSearch} class="search-close" aria-label="Close search">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/if}
            </div>
          </div>
          
          {#if $isPublicPage}
            <!-- On public pages, always show the Sign In button -->
            <a href="/auth" class="btn btn-primary header-btn">Sign In</a>
          {:else if $isLoading}
            <div class="loading-indicator"></div>
          {:else if $user}
            <div class="user-menu-container">
              <button on:click={toggleUserMenu} class="user-menu-button">
                <div class="user-avatar">
                  {#if $user?.profilePicture}
                    <img src={$user.profilePicture} alt="Profile" class="avatar-image" />
                  {:else}
                    {$user?.name ? $user.name.charAt(0).toUpperCase() : 'U'}
                  {/if}
                </div>
                <span class="user-name">{$user.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {#if isUserMenuOpen}
                <div class="user-dropdown">
                  <div class="user-dropdown-header">
                    <div class="user-avatar-large">
                      {#if $user?.profilePicture}
                        <img src={$user.profilePicture} alt="Profile" class="avatar-image" />
                      {:else}
                        {$user?.name ? $user.name.charAt(0).toUpperCase() : 'U'}
                      {/if}
                    </div>
                    <div>
                      <div class="user-dropdown-name">{$user.name}</div>
                      <div class="user-dropdown-email">{$user.email}</div>
                    </div>
                  </div>
                  <div class="user-dropdown-items">
                    <a href="/profile" class="user-dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </a>
                    <a href="/settings" class="user-dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </a>
                    <button on:click={handleLogout} class="user-dropdown-item logout-button">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <a href="/auth" class="btn btn-primary header-btn">Sign In</a>
          {/if}
        </div>
      </div>
    </div>
  </div>
</header>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    width: 100%;
  }

  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border);
    position: relative;
  }

  .logo {
    display: flex;
    align-items: center;
    z-index: 20;
  }

  .logo-image {
    height: 3.5rem;
    width: auto;
  }

  .menu-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--text);
    cursor: pointer;
    padding: 0.5rem;
    z-index: 20;
  }

  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-grow: 1;
    margin-left: 2rem;
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
  }

  .nav-link {
    color: var(--text);
    text-decoration: none;
    transition: color 0.2s ease;
    font-size: 1rem;
    padding: 0.5rem 0;
  }

  .nav-link:hover {
    color: var(--accent);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .search-container {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 2rem;
    height: 2.5rem;
  }

  .search-icon {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-input-container {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    width: 0;
    transition: width 0.3s ease, opacity 0.2s ease;
    opacity: 0;
  }

  .search-container.open .search-input-container {
    width: 200px;
    border-radius: 0.25rem;
    background-color: var(--background-card);
    border: 1px solid var(--border);
    opacity: 1;
  }

  .search-input {
    width: 100%;
    height: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 0.875rem;
    outline: none;
  }

  .search-input::placeholder {
    color: var(--text-secondary);
  }

  .search-close {
    position: absolute;
    right: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    transition: color 0.2s ease;
  }

  .search-close:hover {
    color: var(--accent);
  }

  /* User menu styles */
  .user-menu-container {
    position: relative;
  }

  .user-menu-button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: var(--text);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease;
  }

  .user-menu-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .user-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    background-color: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 0.5rem;
    overflow: hidden;
  }
  
  .user-avatar-large {
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background-color: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.25rem;
    margin-right: 1rem;
  }

  .user-name {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .ml-1 {
    margin-left: 0.25rem;
  }
  
  .mr-2 {
    margin-right: 0.5rem;
  }

  .user-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: 240px;
    background-color: var(--background-card);
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    z-index: 50;
    border: 1px solid var(--border);
    animation: fadeIn 0.2s ease;
  }

  .user-dropdown-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
  }

  .user-dropdown-name {
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .user-dropdown-email {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .user-dropdown-items {
    padding: 0.5rem 0;
  }

  .user-dropdown-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: var(--text);
    text-decoration: none;
    transition: background-color 0.2s ease;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
  }

  .user-dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .logout-button {
    color: #ef4444;
  }

  .logout-button:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }

  /* Loading indicator */
  .loading-indicator {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 9999px;
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-top-color: var(--accent);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Fix for the header button */
  .header-btn {
    color: white !important;
  }

  .header-btn:hover {
    color: white !important;
  }

  .h-5 {
    height: 1.25rem;
  }

  .w-5 {
    width: 1.25rem;
  }

  .h-4 {
    height: 1rem;
  }

  .w-4 {
    width: 1rem;
  }

  .h-6 {
    height: 1.5rem;
  }

  .w-6 {
    width: 1.5rem;
  }

  .text-violet-400 {
    color: #a78bfa;
  }

  @media (max-width: 1024px) {
    .search-container.open .search-input-container {
      width: 180px;
    }
    
    .user-name {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .menu-toggle {
      display: block;
    }
    
    .nav-container {
      position: fixed;
      top: 0;
      right: -100%;
      width: 80%;
      max-width: 300px;
      height: 100vh;
      background-color: var(--background-card);
      flex-direction: column;
      justify-content: flex-start;
      padding: 5rem 1.5rem 2rem;
      z-index: 10;
      transition: right 0.3s ease;
      margin-left: 0;
      box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
    }
    
    .nav-container.open {
      right: 0;
    }
    
    .nav-links {
      flex-direction: column;
      width: 100%;
      margin-bottom: 2rem;
    }
    
    .nav-link {
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border);
      width: 100%;
      display: block;
    }
    
    .actions {
      flex-direction: column;
      width: 100%;
      align-items: flex-start;
      gap: 1.5rem;
    }
    
    .search-container {
      width: 100%;
    }
    
    .search-container.open .search-input-container {
      width: 100%;
    }
    
    .btn {
      width: 100%;
      text-align: center;
    }
    
    .user-menu-button {
      width: 100%;
      justify-content: flex-start;
    }
    
    .user-name {
      display: block;
    }
    
    .user-dropdown {
      position: static;
      width: 100%;
      margin-top: 0.5rem;
      box-shadow: none;
    }
  }

  @media (max-width: 480px) {
    .logo-image {
      height: 2.5rem;
    }
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    object-fit: cover;
  }
</style> 