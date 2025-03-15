<script lang="ts">
  import { user } from '$lib/stores/authStore';
  import type { SellAppProduct } from '$lib/sellapp';
  import { getProductImageUrl, getProductPrice, getProductStock, getProductUrl } from '$lib/sellapp';
  import { fade, slide } from 'svelte/transition';
  import { onMount } from 'svelte';

  export let data: { products: SellAppProduct[], error: string | null };

  let loading = true;
  let error = data?.error || null;
  let products: SellAppProduct[] = [];

  // Debug logging
  console.log('[Client] Raw data received:', data);
  console.log('[Client] Data structure:', {
    hasData: !!data,
    hasProducts: !!data?.products,
    productsLength: data?.products?.length,
    error: data?.error
  });

  // Initialize products from data
  products = data?.products || [];
  console.log('[Client] Initial products:', products);

  // Reactive statements
  $: if (data) {
    console.log('[Client] Data changed:', data);
    products = data.products || [];
    error = data.error || null;
    console.log('[Client] Products updated:', products);
    console.log('[Client] Error state:', error);
  }
  $: loading = false;

  function handlePurchase(product: SellAppProduct) {
    if ($user) {
      const purchaseUrl = getProductUrl(product);
      window.open(purchaseUrl, '_blank');
    }
  }

  onMount(() => {
    console.log('Component mounted');
    console.log('Current products:', products);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
    loading = false;
  });

  let sortOption = 'default';

  // Sorting options
  const sortProducts = (option: string) => {
    sortOption = option;
    const sortedProducts = [...products];
    switch (option) {
      case 'price-low':
        sortedProducts.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case 'stock-low':
        sortedProducts.sort((a, b) => getProductStock(a) - getProductStock(b));
        break;
      case 'stock-high':
        sortedProducts.sort((a, b) => getProductStock(b) - getProductStock(a));
        break;
      default:
        // Default sorting (by id or original order)
        sortedProducts.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));
    }
    products = sortedProducts;
  };
</script>

<div class="shop-container">
  <div class="shop-header" in:fade>
    <h1>Shop</h1>
    <p class="subtitle">Browse our digital products</p>
  </div>

  {#if loading}
    <div class="loading-state" in:fade>
      <div class="loading-spinner" />
      <p>Loading products...</p>
    </div>
  {:else if error}
    <div class="error-state" in:slide>
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <h2 class="error-title">Error Loading Products</h2>
      <p class="error-description">{error}</p>
      <button class="retry-button" on:click={() => window.location.reload()}>
        Retry
      </button>
    </div>
  {:else}
    <div class="shop-controls" in:fade>
      <div class="sort-container">
        <label for="sort">Sort by:</label>
        <select id="sort" bind:value={sortOption} on:change={() => sortProducts(sortOption)}>
          <option value="default">Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="stock-low">Stock: Low to High</option>
          <option value="stock-high">Stock: High to Low</option>
        </select>
      </div>
    </div>

    <div class="shop-grid" in:fade>
      {#each products as product (product.id)}
        <div class="product-card">
          <img 
            src={getProductImageUrl(product)} 
            alt={product.title}
            class="product-image"
          />
          <div class="product-info">
            <h3>{product.title}</h3>
            <p class="description">{product.description}</p>
            <div class="price-stock">
              <span class="price">${getProductPrice(product)}</span>
              <span class="stock">Stock: {getProductStock(product)}</span>
            </div>
            <button 
              class="buy-button" 
              class:disabled={!$user || getProductStock(product) === 0}
              on:click={() => handlePurchase(product)}
              disabled={!$user || getProductStock(product) === 0}
            >
              {#if !$user}
                Sign in to Purchase
              {:else if getProductStock(product) === 0}
                Out of Stock
              {:else}
                Buy Now
              {/if}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .shop-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .shop-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: var(--text-secondary);
    margin-top: 0.5rem;
    font-size: 1.125rem;
  }

  .shop-controls {
    margin-bottom: 2rem;
  }

  .sort-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .sort-container label {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .sort-container select {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid var(--border);
    background: var(--background-card);
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .shop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem;
  }

  .product-card {
    background: var(--surface-2);
    border-radius: 1rem;
    overflow: hidden;
    transition: transform 0.2s ease;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .product-card:hover {
    transform: translateY(-4px);
  }

  .product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .product-info {
    padding: 1.5rem;
  }

  .product-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  .description {
    color: var(--text-2);
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .price-stock {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .price {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--brand);
  }

  .stock {
    color: var(--text-2);
  }

  .buy-button {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: var(--brand);
    color: white;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .buy-button:hover:not(.disabled) {
    opacity: 0.9;
  }

  .buy-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading-state, .error-state {
    text-align: center;
    padding: 4rem 2rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 1rem;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem;
    color: var(--text-secondary);
  }

  .error-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .error-description {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .retry-button {
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .retry-button:hover {
    background: #7c3aed;
  }

  @media (max-width: 768px) {
    .shop-container {
      padding: 1rem;
    }

    .shop-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }
  }
</style> 