import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { user, isLoading } from '../../lib/stores/userStore';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // Only run this in the browser
  if (browser) {
    // Wait a bit for the user store to initialize if it's loading
    if (get(isLoading)) {
      await new Promise(resolve => {
        const unsubscribe = isLoading.subscribe(value => {
          if (!value) {
            unsubscribe();
            resolve(null);
          }
        });
        
        // Fallback timeout in case loading never completes
        setTimeout(() => {
          unsubscribe();
          resolve(null);
        }, 3000);
      });
    }
    
    // If after loading there's no user, redirect to auth page
    if (!get(user)) {
      goto('/auth');
    }
  }
  
  return {};
}; 