import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent, url }) => {
  const { user } = await parent();
  
  // If user is already logged in, redirect them
  if (user) {
    // If there's a redirect parameter, use that
    const redirectTo = url.searchParams.get('redirect') || '/';
    throw redirect(302, redirectTo);
  }

  return {
    redirectTo: url.searchParams.get('redirect') || '/'
  };
}; 