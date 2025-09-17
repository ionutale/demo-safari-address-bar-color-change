<script>
	import { onMount } from 'svelte';

	let metaTag;
	let currentColor = '#ffffff';

	onMount(() => {
		metaTag = document.querySelector('meta[name="theme-color"]');

		// Simple scroll-based color changer
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const windowHeight = window.innerHeight;
			const scrollRatio = scrollY / windowHeight;

			// Change colors based on scroll position
			if (scrollRatio > 0.8) {
				// Black section
				currentColor = '#000000';
				document.body.style.backgroundColor = '#000000';
			} else if (scrollRatio > 0.4) {
				// Gray section
				currentColor = '#666666';
				document.body.style.backgroundColor = '#666666';
			} else {
				// White section
				currentColor = '#ffffff';
				document.body.style.backgroundColor = '#ffffff';
			}

			if (metaTag) {
				metaTag.setAttribute('content', currentColor);
			}
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<svelte:head>
	<title>Safari Address Bar Color Demo</title>
	<meta name="description" content="Demo of dynamic Safari address bar color changes" />
</svelte:head>

<div class="min-h-screen">
	<!-- White Section -->
	<section class="h-screen flex items-center justify-center bg-white text-black">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Safari Address Bar Demo</h1>
			<p class="text-xl mb-8">Scroll down to see the address bar colors change</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<!-- Gray Section -->
	<section class="h-screen flex items-center justify-center bg-gray-400 text-black">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Gray Section</h1>
			<p class="text-xl mb-8">The address bar should now be gray</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<!-- Black Section -->
	<section class="h-screen flex items-center justify-center bg-black text-white">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Black Section</h1>
			<p class="text-xl mb-8">The address bar should now be black</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<!-- Additional colorful sections -->
	<section class="h-screen flex items-center justify-center bg-blue-500 text-white">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Blue Section</h1>
			<p class="text-xl mb-8">Blue background with white text</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<section class="h-screen flex items-center justify-center bg-red-500 text-white">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Red Section</h1>
			<p class="text-xl mb-8">Red background with white text</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<section class="h-screen flex items-center justify-center bg-green-500 text-white">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Green Section</h1>
			<p class="text-xl mb-8">Green background with white text</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>
</div>

<style>
	body {
		transition: background-color 0.3s ease;
	}
</style>
