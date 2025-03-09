<script lang="ts">
	import { DependencyResolver, type Framework } from '$lib/worker/index.js';

	/**
	 * Helper for pretty-printing results
	 */
	function prettyPrint(label: string, obj: any): void {
		console.log(`\n=== ${label} ===`);
		console.log(JSON.stringify(obj, null, 2));
	}

	/**
	 * Run a resolver test case
	 */
	async function runTest(
		resolver: DependencyResolver,
		label: string,
		importPath: string,
		framework: Framework = 'js',
		version?: string,
	): Promise<void> {
		if (importPath !== 'unfetch') return;
		console.log(`\n\n-------------------- TEST: ${label} --------------------`);
		console.log(`Import: "${importPath}" (${framework})`);

		try {
			const result = await resolver.resolve(importPath, { framework, version });
			prettyPrint('RESULT', result);

			// Try to fetch content if it's a URL
			if (result.resolved_url.startsWith('http')) {
				try {
					console.log(`Fetching content from ${result.resolved_url}...`);
					const content = await resolver.fetch_content(result.resolved_url);
					console.log(`Content length: ${content.length} bytes`);
					console.log(`Content preview: ${content.substring(0, 100)}...`);

					// Check if it's ESM compatible (has imports or exports)
					const hasEsmSyntax = content.includes('export ') || content.includes('import ');
					console.log(`ESM Compatible: ${hasEsmSyntax ? 'Yes' : 'No'}`);

					// Check if it's CommonJS (has require or module.exports)
					const hasCommonJS = content.includes('require(') || content.includes('module.exports');
					console.log(`CommonJS: ${hasCommonJS ? 'Yes' : 'No'}`);

					// Check for browser specific environment references
					const hasBrowserApis =
						content.includes('window.') ||
						content.includes('document.') ||
						content.includes('navigator.') ||
						content.includes('localStorage') ||
						content.includes('sessionStorage');
					console.log(`Browser APIs: ${hasBrowserApis ? 'Yes' : 'No'}`);

					// Check for process references (might indicate Node.js code)
					const hasProcessRefs = content.includes('process.') || content.includes('global.');
					console.log(`Node.js References: ${hasProcessRefs ? 'Yes' : 'No'}`);
				} catch (error) {
					console.error(
						`Failed to fetch content: ${error instanceof Error ? error.message : error}`,
					);
				}
			}
		} catch (error) {
			console.error(`ERROR: ${error instanceof Error ? error.message : error}`);
		}
	}

	/**
	 * Main function to run browser-related package tests
	 */
	async function main() {
		console.log('Creating DependencyResolver...');
		const resolver = new DependencyResolver();

		// ---- UI Libraries ----
		await runTest(resolver, 'React', 'react', 'react');
		await runTest(resolver, 'React DOM', 'react-dom', 'react');
		await runTest(resolver, 'Vue', 'vue', 'vue');
		await runTest(resolver, 'Angular Core', '@angular/core');
		await runTest(resolver, 'Svelte', 'svelte', 'svelte');
		await runTest(resolver, 'Preact', 'preact', 'react');
		await runTest(resolver, 'Solid.js', 'solid-js', 'solid');
		await runTest(resolver, 'Alpine.js', 'alpinejs');
		await runTest(resolver, 'Lit', 'lit');

		// ---- Animation & Graphics ----
		await runTest(resolver, 'Three.js', 'three');
		await runTest(resolver, 'GreenSock (GSAP)', 'gsap');
		await runTest(resolver, 'D3.js', 'd3');
		await runTest(resolver, 'Chart.js', 'chart.js');
		await runTest(resolver, 'Anime.js', 'animejs');
		await runTest(resolver, 'Motion One', 'motion');
		await runTest(resolver, 'Framer Motion', 'framer-motion', 'react');
		await runTest(resolver, 'SVG.js', '@svgdotjs/svg.js');
		await runTest(resolver, 'PixiJS', 'pixi.js');

		// ---- UI Component Libraries ----
		await runTest(resolver, 'Material UI', '@mui/material', 'react');
		await runTest(resolver, 'Ant Design', 'antd', 'react');
		await runTest(resolver, 'Chakra UI', '@chakra-ui/react', 'react');
		await runTest(resolver, 'Tailwind CSS', 'tailwindcss');
		await runTest(resolver, 'Bootstrap', 'bootstrap');
		await runTest(resolver, 'Bulma', 'bulma');
		await runTest(resolver, 'Vuetify', 'vuetify', 'vue');
		await runTest(resolver, 'Element Plus', 'element-plus', 'vue');
		await runTest(resolver, 'PrimeVue', 'primevue', 'vue');
		await runTest(resolver, 'Ionic Framework', '@ionic/core');

		// ---- State Management ----
		await runTest(resolver, 'Redux', 'redux');
		await runTest(resolver, 'React Redux', 'react-redux', 'react');
		await runTest(resolver, 'Redux Toolkit', '@reduxjs/toolkit');
		await runTest(resolver, 'MobX', 'mobx');
		await runTest(resolver, 'MobX React', 'mobx-react', 'react');
		await runTest(resolver, 'Zustand', 'zustand');
		await runTest(resolver, 'XState', 'xstate');
		await runTest(resolver, 'Recoil', 'recoil', 'react');
		await runTest(resolver, 'Pinia', 'pinia', 'vue');
		await runTest(resolver, 'Jotai', 'jotai', 'react');

		// ---- Data Visualization ----
		await runTest(resolver, 'Highcharts', 'highcharts');
		await runTest(resolver, 'ECharts', 'echarts');
		await runTest(resolver, 'Recharts', 'recharts', 'react');
		await runTest(resolver, 'Victory', 'victory', 'react');
		await runTest(resolver, 'React-Vis', 'react-vis', 'react');
		await runTest(resolver, 'Plotly.js', 'plotly.js');
		await runTest(resolver, 'Nivo', '@nivo/core', 'react');
		await runTest(resolver, 'Visx', '@visx/xychart', 'react');

		// ---- HTTP & Networking ----
		await runTest(resolver, 'Axios', 'axios');
		await runTest(resolver, 'Fetch', 'node-fetch');
		await runTest(resolver, 'SWR', 'swr', 'react');
		await runTest(resolver, 'React Query', '@tanstack/react-query', 'react');
		await runTest(resolver, 'GraphQL', 'graphql');
		await runTest(resolver, 'Apollo Client', '@apollo/client', 'react');
		await runTest(resolver, 'URQL', 'urql', 'react');
		await runTest(resolver, 'Socket.IO Client', 'socket.io-client');
		await runTest(resolver, 'WS (WebSocket)', 'ws');

		// ---- Form & Input ----
		await runTest(resolver, 'React Hook Form', 'react-hook-form', 'react');
		await runTest(resolver, 'Formik', 'formik', 'react');
		await runTest(resolver, 'Yup', 'yup');
		await runTest(resolver, 'Zod', 'zod');
		await runTest(resolver, 'Final Form', 'final-form');
		await runTest(resolver, 'React Final Form', 'react-final-form', 'react');
		await runTest(resolver, 'Vee-Validate', 'vee-validate', 'vue');
		await runTest(resolver, 'React Dropzone', 'react-dropzone', 'react');
		await runTest(resolver, 'Cleave.js', 'cleave.js');

		// ---- Utility Libraries ----
		await runTest(resolver, 'Lodash', 'lodash');
		await runTest(resolver, 'Ramda', 'ramda');
		await runTest(resolver, 'Date-fns', 'date-fns');
		await runTest(resolver, 'Moment.js', 'moment');
		await runTest(resolver, 'Luxon', 'luxon');
		await runTest(resolver, 'Day.js', 'dayjs');
		await runTest(resolver, 'UUID', 'uuid');
		await runTest(resolver, 'Immer', 'immer');
		await runTest(resolver, 'Decimal.js', 'decimal.js');
		await runTest(resolver, 'Marked', 'marked');

		// ---- Browser-specific APIs ----
		await runTest(resolver, 'Cookie Library', 'js-cookie');
		await runTest(resolver, 'Howler.js (Audio)', 'howler');
		await runTest(resolver, 'VideoJS', 'video.js');
		await runTest(resolver, 'Hls.js', 'hls.js');
		await runTest(resolver, 'Hammer.js (Touch)', 'hammerjs');
		await runTest(resolver, 'Browser Storage', 'localforage');
		await runTest(resolver, 'Web Workers', 'workerize');
		await runTest(resolver, 'MapboxGL', 'mapbox-gl');
		await runTest(resolver, 'Leaflet', 'leaflet');
		await runTest(resolver, 'TensorFlow.js', '@tensorflow/tfjs');

		// ---- Testing Browser Polyfills ----
		await runTest(resolver, 'Fake Timers', '@sinonjs/fake-timers');
		await runTest(resolver, 'Core-js', 'core-js');
		await runTest(resolver, 'Regenerator-runtime', 'regenerator-runtime');
		await runTest(resolver, 'Promise Polyfill', 'promise-polyfill');
		await runTest(resolver, 'Unfetch', 'unfetch');
		await runTest(resolver, 'Proxy Polyfill', 'proxy-polyfill');
		await runTest(resolver, 'Browser Crypto Shim', 'crypto-browserify');
		await runTest(resolver, 'BigInt Polyfill', 'BigInt');

		// ---- Mixed Module Pattern Packages ----
		await runTest(resolver, 'React Router', 'react-router-dom', 'react');
		await runTest(resolver, 'Vue Router', 'vue-router', 'vue');
		await runTest(resolver, 'Firebase', 'firebase/app');
		await runTest(resolver, 'Monaco Editor', 'monaco-editor');
		await runTest(resolver, 'Slate Editor', 'slate', 'react');
		await runTest(resolver, 'ProseMirror', 'prosemirror-state');
		await runTest(resolver, 'Tone.js', 'tone');
		await runTest(resolver, 'Excalibur.js (Game)', 'excalibur');

		// ---- Package with Browser Field Mapping ----
		await runTest(resolver, 'Package with browser field string', 'buffer');
		await runTest(resolver, 'Package with browser field object (simple)', 'path-browserify');
		await runTest(resolver, 'Package with browser field object (complex)', 'stream-browserify');
		await runTest(resolver, 'Package with browser field false entry', 'assert');
		await runTest(resolver, 'Package with conditional exports', 'esbuild');
		await runTest(resolver, 'Package with browser conditional in exports', 'execa');

		// ---- Edge Cases ----
		await runTest(resolver, 'Package with UMD and ESM builds', 'jquery');
		await runTest(resolver, 'Package with dynamic imports', 'lodash-es');
		await runTest(resolver, 'Package with web worker exports', 'comlink');
		await runTest(resolver, 'Package with CSS imports', 'bootstrap');
		await runTest(resolver, 'Package that depends on process.env', 'cross-env');
		await runTest(resolver, 'Package with browser/node dual compatibility', 'isomorphic-fetch');
		await runTest(resolver, 'WebAssembly dependent package', 'sql.js');
		await runTest(resolver, 'Web Components package', '@shoelace-style/shoelace');

		console.log('\n\nBrowser package tests completed!');
	}

	// Run the main function and handle any unexpected errors
	main().catch((error) => {
		console.error('Unhandled error:', error);
	});
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
