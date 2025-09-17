<script lang="ts">
	import { onMount } from 'svelte';

	let metaTag: HTMLMetaElement | null = null;
	let currentColor = '#ffffff';
	let splitBars = true; // default to split for better iOS reliability

	let observerTop: IntersectionObserver | null = null;
	let observerBottom: IntersectionObserver | null = null;

	const colors = [
		'#ffffff',
		'#f2f2f2',
		'#111111',
		'#2563eb',
		'#ef4444',
		'#22c55e'
	];

	function setBodyColor(color: string) {
		document.body.style.backgroundColor = color;
	}

	function setThemeColor(color: string) {
		if (!metaTag) return;
		metaTag.setAttribute('content', color);
	}

	function repaintThemeColor(original: string) {
		if (!metaTag) return;
		metaTag.setAttribute('content', original + 'fe');
		const m = metaTag;
		requestAnimationFrame(() => m.setAttribute('content', original));
	}

	function setupSyncedScroll() {
		let ticking = false;
		const update = () => {
			const unit = window.innerHeight;
			const idx = Math.min(colors.length - 1, Math.floor(window.scrollY / unit));
			currentColor = colors[idx];
			setBodyColor(currentColor);
			setThemeColor(currentColor);
			repaintThemeColor(currentColor); // ensure nav bar repaints
			ticking = false;
		};
		const onScroll = () => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		};
		window.addEventListener('scroll', onScroll);
		update();
		return () => window.removeEventListener('scroll', onScroll);
	}

	function setupSplitObservers() {
		const all = Array.from(document.querySelectorAll('[data-metathemeswap-color]'));
		// determine sticky header height to place top sampling line below it
		const header = document.querySelector('.js-modebar') as HTMLElement | null;
		const headerH = header ? header.offsetHeight : 0;

		const topCb: IntersectionObserverCallback = (entries) => {
			const intersecting = entries.find((e) => e.isIntersecting);
			if (!intersecting || !metaTag) return;
			const color = (intersecting.target as HTMLElement).dataset.metathemeswapColor;
			if (!color) return;
			currentColor = color;
			setThemeColor(color);
		};
		const bottomCb: IntersectionObserverCallback = (entries) => {
			const intersecting = entries.find((e) => e.isIntersecting);
			if (!intersecting || !metaTag) return;
			const color = (intersecting.target as HTMLElement).dataset.metathemeswapColor;
			if (!color) return;
			setBodyColor(color);
			repaintThemeColor(currentColor);
		};

		// create ~1px sampling lines: one under the sticky header, one at viewport bottom
		const vh = window.innerHeight;
		observerTop = new IntersectionObserver(topCb, {
			rootMargin: `-${headerH}px 0px -${Math.max(vh - headerH - 1, 0)}px 0px`
		});
		observerBottom = new IntersectionObserver(bottomCb, {
			rootMargin: `-${Math.max(vh - 1, 0)}px 0px 0px 0px`
		});
		all.forEach((el) => {
			observerTop?.observe(el);
			observerBottom?.observe(el);
		});
		// initialize
		setBodyColor('#ffffff');
		setThemeColor('#ffffff');
		return () => {
			all.forEach((el) => {
				observerTop?.unobserve(el);
				observerBottom?.unobserve(el);
			});
			observerTop?.disconnect();
			observerBottom?.disconnect();
		};
	}

	let teardown: (() => void) | null = null;

	function initMode() {
		teardown?.();
		if (splitBars) {
			teardown = setupSplitObservers();
		} else {
			teardown = setupSyncedScroll();
		}
	}

	function toggleMode() {
		splitBars = !splitBars;
		initMode();
	}

	onMount(() => {
		metaTag = document.querySelector('meta[name="theme-color"]');
		// ensure sections have data attributes
		document.querySelectorAll('[data-color]').forEach((el) => {
			const color = (el as HTMLElement).dataset.color || '';
			(el as HTMLElement).dataset.metathemeswapColor = color;
		});
		initMode();
		const onResize = () => initMode();
		window.addEventListener('resize', onResize);
		window.addEventListener('orientationchange', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('orientationchange', onResize);
			teardown?.();
		};
	});
</script>

<svelte:head>
	<title>Safari Address Bar Color Demo</title>
	<meta name="description" content="Demo of dynamic Safari address bar color changes" />
</svelte:head>

<div class="min-h-screen">
	<div class="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 text-sm text-gray-700 js-modebar">
		<div class="max-w-3xl mx-auto flex items-center gap-3 py-2 px-4">
			<span class="font-medium">Mode:</span>
			<button
				class="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
				on:click={toggleMode}
			>
				{splitBars ? 'Split (Status + Nav independent)' : 'Synced (Both follow section)'}
			</button>
			<span class="ml-auto">Current: {currentColor}</span>
		</div>
	</div>
	<!-- White Section -->
	<section data-color="#ffffff" class="h-screen flex items-center justify-center bg-white text-black">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Safari Address Bar Demo</h1>
			<p class="text-xl mb-8">Scroll down to see the address bar colors change</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<!-- Gray Section -->
	<section data-color="#f2f2f2" class="h-screen flex items-center justify-center bg-gray-200 text-black">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Gray Section</h1>
			<p class="text-xl mb-8">The address bar should now be gray</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<!-- Black Section -->
	<section data-color="#111111" class="h-screen flex items-center justify-center bg-black text-white">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Black Section</h1>
			<p class="text-xl mb-8">The address bar should now be black</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<!-- Additional colorful sections -->
	<section data-color="#2563eb" class="h-screen flex items-center justify-center bg-blue-500 text-white">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Blue Section</h1>
			<p class="text-xl mb-8">Blue background with white text</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<section data-color="#ef4444" class="h-screen flex items-center justify-center bg-red-500 text-white">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Red Section</h1>
			<p class="text-xl mb-8">Red background with white text</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>

	<section data-color="#22c55e" class="h-screen flex items-center justify-center bg-green-500 text-white">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Green Section</h1>
			<p class="text-xl mb-8">Green background with white text</p>
			<p class="text-lg">Current color: {currentColor}</p>
		</div>
	</section>
</div>

