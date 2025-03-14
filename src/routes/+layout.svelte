<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	
	let companyName = "Foundation";
</script>

<div class="layout">
	<Header {companyName} />
	
	<main class="main-content">
		<slot />
	</main>
	
	<Footer {companyName} />
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	
	.main-content {
		flex: 1;
	}
	
	@media (max-width: 768px) {
		.main-content {
			padding-top: 0;
		}
	}
</style>
