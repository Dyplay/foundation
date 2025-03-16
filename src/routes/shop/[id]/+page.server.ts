import type { PageServerLoad } from './$types';
import { fetchProducts } from '$lib/server/gumroad.server';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const { products } = await fetchProducts();
    const product = products.find(p => p.id === params.id);

    if (!product) {
        throw error(404, 'Product not found');
    }

    return {
        product
    };
}; 