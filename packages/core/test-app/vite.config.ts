import { sveltekit } from '@sveltejs/kit/vite';
import { kitRoutes } from 'vite-plugin-kit-routes';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), kitRoutes()],
	server: {
		port: 3291,
	},
});
