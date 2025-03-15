import type { PageServerLoad } from './$types';
import { fetchProducts } from '$lib/server/sellapp.server';

export const load: PageServerLoad = async () => {
  console.log('[Page Server] Loading shop page...');
  const { products, error } = await fetchProducts();
  console.log('[Page Server] Fetched products:', { products, error });
  return { products, error };
}; 