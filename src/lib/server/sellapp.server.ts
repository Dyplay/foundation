import { SELLAPP_API_KEY } from '$env/static/private';
import type { SellAppProduct } from '$lib/sellapp';

interface ApiResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

const API_BASE = 'https://sell.app/api';
const API_VERSION = '/v2';

// Log API configuration (server-side only)
console.log('[Server] Using Sell.app API URL:', API_BASE + API_VERSION);
console.log('[Server] API Key configured:', !!SELLAPP_API_KEY);

export async function fetchProducts() {
  try {
    if (!SELLAPP_API_KEY) {
      console.error('[Server] No Sell.app API key configured');
      return { products: [], error: 'API key not configured' };
    }

    console.log('[Server] Fetching products...');
    const response = await fetch(`${API_BASE}${API_VERSION}/products`, {
      headers: {
        'Authorization': `Bearer ${SELLAPP_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('[Server] Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('[Server] Sell.app API error:', error);
      return { products: [], error: 'Failed to fetch products' };
    }

    const result: ApiResponse<SellAppProduct> = await response.json();
    console.log('[Server] Raw API response:', JSON.stringify(result, null, 2));
    console.log('[Server] Successfully fetched', result.data.length, 'products');
    
    // Log first product for debugging
    if (result.data.length > 0) {
      console.log('[Server] First product:', JSON.stringify(result.data[0], null, 2));
    }
    
    return {
      products: result.data || [],
      error: null
    };
  } catch (error) {
    console.error('[Server] Failed to fetch products:', error);
    return { 
      products: [], 
      error: 'Failed to load products'
    };
  }
} 