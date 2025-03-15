import type { PageLoad } from './$types';

interface ShopItem {
  title: string;
  description: string;
  link: string;
  image: string;
  price: string;
}

export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch('/api/kofi-shop');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Ko-fi shop items:', error);
    return {
      items: []
    };
  }
}; 