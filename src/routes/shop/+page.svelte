<script lang="ts">
  import type { GumroadProduct } from '$lib/server/gumroad.server';
  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';

  export let data: { products: GumroadProduct[], error: string | null };

  let sortOption = 'name';
  let products = data.products.filter(product => !product.name.toLowerCase().includes('membership'));

  function getProductImage(product: GumroadProduct): string {
    return product.preview_url || '/images/placeholder.png';
  }

  function goToProduct(product: GumroadProduct) {
    goto(`/shop/${product.id}`);
  }

  function sortProducts(option: string) {
    sortOption = option;
    products = [...data.products]
      .filter(product => !product.name.toLowerCase().includes('membership'))
      .sort((a, b) => {
        switch (option) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'sales':
            return b.sales_count - a.sales_count;
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }
</script>

<div class="container">
  <h1 class="">Shop</h1>

  {#if data.error}
    <div class="error" transition:fade>
      <p>{data.error}</p>
    </div>
  {:else}
    <div class="sort-container">
      <select bind:value={sortOption} on:change={() => sortProducts(sortOption)}>
        <option value="name">Sort by Name</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="sales">Most Popular</option>
      </select>
    </div>

    <div class="products-grid">
      {#each products as product (product.id)}
        <div class="product-card" transition:fade>
          <div class="product-content" on:click={() => goToProduct(product)} on:keydown={(e) => e.key === 'Enter' && goToProduct(product)} role="button" tabindex="0">
            <div class="product-image">
              <img src={getProductImage(product)} alt={product.name} />
            </div>
            <div class="product-info">
              <h2>{product.name}</h2>
              <p class="product-summary">{product.custom_summary || product.description}</p>
              <div class="product-meta">
                <span class="price">{product.formatted_price}</span>
                <span class="sales">{product.sales_count} sold</span>
              </div>
            </div>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" on:click={() => goToProduct(product)}>
              View Details
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  .sort-container {
    margin-bottom: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  select {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid var(--border);
    background-color: var(--background-card);
    color: var(--text);
    font-size: 0.875rem;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
  }

  .product-card {
    background: var(--background-card);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .product-content {
    flex: 1;
    cursor: pointer;
  }

  .product-content:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--accent);
  }

  .product-image {
    aspect-ratio: 16/9;
    overflow: hidden;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-info {
    padding: 1.5rem;
  }

  .product-info h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  .product-summary {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .price {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--accent);
  }

  .sales {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .product-actions {
    padding: 0 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }

  .btn-secondary {
    background-color: var(--background);
    border: 1px solid var(--border);
    color: var(--text);
  }

  .btn-secondary:hover {
    background-color: var(--background-hover);
  }

  .error {
    background-color: rgb(254, 226, 226);
    border: 1px solid rgb(248, 113, 113);
    color: rgb(185, 28, 28);
    padding: 1rem;
    border-radius: 0.375rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 640px) {
    .products-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 