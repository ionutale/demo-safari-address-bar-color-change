import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const isDev = process.env.NODE_ENV === 'development';

const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		paths: {
			base: isDev ? '' : '/demo-safari-address-bar-color-change'
		}
	}
};

export default config;
