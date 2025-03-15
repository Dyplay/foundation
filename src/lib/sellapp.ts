// Export the product interface
export interface SellAppProduct {
  id: number;
  title: string;
  slug: string;
  description: string;
  images: ProductImage[];
  order: number;
  visibility: 'PUBLIC' | 'ON_HOLD' | 'HIDDEN' | 'PRIVATE';
  delivery_text?: string;
  additional_information: AdditionalInfo[];
  other_settings: OtherSettings;
  variants: ProductVariant[];
  url: string;
  store_id: number;
  category_id?: number;
  section_id?: number;
  section_order?: number;
  is_discoverable: number;
  created_at: string;
  updated_at: string;
}

interface ProductImage {
  path: string;
  metadata: {
    size: number;
    filename: string;
    extension: string;
    mime_type: string;
  };
}

interface AdditionalInfo {
  required: boolean;
  key: string;
  type: 'TEXT' | 'NUMBER' | 'HIDDEN' | 'TEXTAREA' | 'CHECKBOX';
  label: string;
}

interface OtherSettings {
  faq?: Array<{ question: string; answer: string; }>;
  video_url?: string;
  redirect_url?: string;
  product_title?: string;
  product_description?: string;
}

interface ProductVariant {
  id: number;
  title: string;
  price: number;
  stock: number;
}

// Client-side helper functions
export function getProductImageUrl(product: SellAppProduct): string {
  if (product.images?.[0]?.path) {
    return `https://sell.app/storage/${product.images[0].path}`;
  }
  return 'https://placehold.co/600x400?text=No+Image';
}

export function getProductPrice(product: SellAppProduct): number {
  if (product.variants?.[0]?.price) {
    return product.variants[0].price;
  }
  return 0;
}

export function getProductStock(product: SellAppProduct): number {
  if (product.variants?.[0]?.stock) {
    return product.variants[0].stock;
  }
  return 0;
}

export function getProductUrl(product: SellAppProduct): string {
  return product.url || `https://eonfluxtech.sell.app/p/${product.id}`;
} 