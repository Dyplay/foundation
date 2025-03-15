import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { XMLParser } from 'fast-xml-parser';

export const GET: RequestHandler = async ({ fetch }) => {
  try {
    const response = await fetch('https://ko-fi.com/dyplay/shop.rss');
    const text = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });

    const result = parser.parse(text);
    const items = result.rss?.channel?.item || [];

    // Transform items to our format
    const shopItems = Array.isArray(items) ? items.map(item => ({
      title: item.title || '',
      description: item.description || '',
      link: item.link || '',
      image: item.enclosure?.['@_url'] || '',
      price: item['ko-fi:price'] || ''
    })) : [];

    return json({ items: shopItems });
  } catch (error) {
    console.error('Error fetching Ko-fi shop items:', error);
    return json({ items: [] });
  }
}; 