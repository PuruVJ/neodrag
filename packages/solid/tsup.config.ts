import { defineConfig } from 'ttsup';

export default defineConfig({
	entry: ['./src/index.ts'],
	external: ['solid-js'],
	minify: 'terser',
	format: 'esm',
	dts: {
		resolve: true,
		banner: `import 'solid-js';

declare module 'solid-js' {	
    namespace JSX {
        interface Directives {
            draggable: DragOptions;
        }
    }
}
`,
	},
	clean: true,
	sourcemap: true,
});
