import { GUMROAD_ACCESS_TOKEN } from '$env/static/private';

export interface GumroadProduct {
    id: string;
    name: string;
    preview_url: string | null;
    description: string;
    url: string | null;
    price: number;
    currency: string;
    short_url: string;
    formatted_price: string;
    custom_summary: string;
    customizable_price: boolean;
    published: boolean;
    sales_count: number;
    tags: string[];
    variants: any[];
}

export interface GumroadResponse {
    success: boolean;
    products: GumroadProduct[];
}

export async function fetchProducts(): Promise<{ products: GumroadProduct[], error: string | null }> {
    try {
        if (!GUMROAD_ACCESS_TOKEN) {
            console.error('[Server] No Gumroad access token configured');
            return { products: [], error: 'API key not configured' };
        }

        const response = await fetch('https://api.gumroad.com/v2/products', {
            headers: {
                'Authorization': `Bearer ${GUMROAD_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GumroadResponse = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to fetch products from Gumroad');
        }

        return {
            products: data.products,
            error: null
        };
    } catch (error) {
        console.error('Error fetching Gumroad products:', error);
        return {
            products: [],
            error: error instanceof Error ? error.message : 'Failed to load products'
        };
    }
} 