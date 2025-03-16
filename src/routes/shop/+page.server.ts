import type { PageServerLoad } from './$types';
import { fetchProducts } from '$lib/server/gumroad.server';

export const load: PageServerLoad = async () => {
    const { products, error } = await fetchProducts();
    
    return {
        products,
        error
    };
}; 