<script lang="ts">
  import { onMount } from 'svelte';
  import { user, isLoading, initUserStore } from '$lib/stores/userStore';
  import type { GumroadProduct } from '$lib/server/gumroad.server';
  import { fade } from 'svelte/transition';

  export let data;
  let product: GumroadProduct | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(() => {
    initUserStore();
    fetchProduct();
  });

  async function fetchProduct() {
    try {
      loading = true;
      const response = await fetch(`/api/gumroad/products/${data.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch product from Gumroad');
      }

      const responseData = await response.json();
      console.log('Gumroad response:', responseData); // Debug log

      if (!responseData || !responseData.success) {
        throw new Error('Invalid Gumroad response');
      }

      product = responseData.product;
      console.log('Found product:', product);
    } catch (err) {
      console.error('Error fetching product:', err);
      error = err instanceof Error ? err.message : 'Failed to load product';
    } finally {
      loading = false;
    }
  }

  function handlePurchase() {
    if (product) {
      // Extract the permalink from the short_url or use a custom_permalink if available
      const permalink = product.custom_permalink || 
        product.short_url?.split('/').pop() || 
        product.id;
      
      // Construct the checkout URL with the permalink and referrer
      const checkoutUrl = new URL('https://gumroad.com/checkout');
      checkoutUrl.searchParams.set('product', permalink);
      checkoutUrl.searchParams.set('quantity', '1');
      checkoutUrl.searchParams.set('referrer', window.location.href);
      
      window.location.href = checkoutUrl.toString();
    }
  }
</script>

<div class="product-page" in:fade>
  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner" />
      <p>Loading product...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <h2 class="error-title">Error Loading Product</h2>
      <p class="error-description">{error}</p>
      <button class="retry-button" on:click={() => window.location.reload()}>
        Retry
      </button>
    </div>
  {:else if product}
    <div class="product-container">
      <div class="product-image-section">
        <img 
          src={product.thumbnail_url || product.preview_url || '/placeholder-product.png'} 
          alt={product.name}
          class="product-image"
        />
      </div>
      <div class="product-details">
        <h1 class="product-title">{product.name}</h1>
        <div class="price-section">
          <span class="price">{product.formatted_price}</span>
          {#if product.sales_count > 0}
            <span class="sales-badge">{product.sales_count} sold</span>
          {/if}
        </div>
        {#if product.custom_summary}
          <p class="summary">{product.custom_summary}</p>
        {/if}
        <div class="description">
          {@html product.description}
        </div>
        <button 
          class="buy-button" 
          class:disabled={!$user}
          on:click={handlePurchase}
          disabled={!$user}
        >
          {#if !$user}
            Sign in to Purchase
          {:else}
            Buy Now
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .product-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .product-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    background: var(--surface-1);
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05),
                0 2px 4px -2px rgb(0 0 0 / 0.05);
  }

  .product-image-section {
    position: relative;
    background: var(--surface-2);
    border-right: 1px solid var(--border);
  }

  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-details {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .product-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-1);
    margin: 0;
    line-height: 1.2;
  }

  .price-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .price {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sales-badge {
    font-size: 0.875rem;
    font-weight: 500;
    background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    box-shadow: 0 2px 4px rgb(139 92 246 / 0.2);
  }

  .summary {
    font-size: 1.125rem;
    color: var(--text-2);
    font-style: italic;
    padding: 1rem;
    background: var(--surface-2);
    border-radius: 0.75rem;
    border: 1px solid var(--border);
  }

  .description {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text-2);
  }

  .buy-button {
    width: 100%;
    padding: 1rem;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 1.125rem;
    margin-top: auto;
  }

  .buy-button:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(139 92 246 / 0.25);
  }

  .buy-button:active:not(.disabled) {
    transform: translateY(0);
  }

  .buy-button.disabled {
    background: linear-gradient(135deg, var(--text-2) 0%, var(--text-3) 100%);
    opacity: 0.7;
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
    color: var(--text-2);
  }

  .error-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-1);
  }

  .error-description {
    color: var(--text-2);
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

  @media (max-width: 1024px) {
    .product-container {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .product-image-section {
      border-right: none;
      border-bottom: 1px solid var(--border);
      aspect-ratio: 16/9;
    }
  }

  @media (max-width: 768px) {
    .product-page {
      padding: 1rem;
    }

    .product-details {
      padding: 1.5rem;
    }

    .product-title {
      font-size: 2rem;
    }

    .price {
      font-size: 1.75rem;
    }
  }
</style> 