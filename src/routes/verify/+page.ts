import type { PageLoad } from './$types';
import { isPublicPage } from '$lib/stores/userStore';

export const load: PageLoad = async () => {
  // Mark this as a public page
  isPublicPage.set(true);
  
  return {
    // This is a public page, no need to check authentication
    isPublic: true
  };
}; 