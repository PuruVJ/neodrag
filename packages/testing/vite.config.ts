// Unified config for @neodrag/test — build only (no tests). `vp pack` reads `pack` (was tsdown.config.ts).
export default {
	pack: {
		entry: { index: './src/index.ts' },
		format: 'esm',
		dts: true,
		clean: true,
		platform: 'browser',
		target: 'esnext',
		treeshake: { moduleSideEffects: false },
	},
};
