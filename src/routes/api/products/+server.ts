import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GUMROAD_ACCESS_TOKEN } from '$env/static/private';

const GUMROAD_API_URL = 'https://api.gumroad.com/v2';

export const GET: RequestHandler = async () => {
  try {
    if (!GUMROAD_ACCESS_TOKEN) {
      console.error('Gumroad API key not found in environment variables');
      throw new Error('Gumroad API key not configured');
    }

    const response = await fetch(`${GUMROAD_API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${GUMROAD_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gumroad API error response:', errorData);
      throw new Error(`Gumroad API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gumroad API response:', data);
    
    return json({
      success: true,
      products: data.products
    });
  } catch (error) {
    console.error('Gumroad API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    }, { status: 500 });
  }
}; 