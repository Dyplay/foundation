import type { PageLoad } from './$types';
import type { GumroadProduct } from '$lib/server/gumroad.server';

export const load: PageLoad = async ({ data }) => {
  return {
    products: data.products as GumroadProduct[],
    error: data.error as string | null
  };
}; 