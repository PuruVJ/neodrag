import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';

const profileNoop = fileURLToPath(new URL('./src/profile/noop.ts', import.meta.url));
const agentLog = fileURLToPath(new URL('./src/sortable/agent-log.ts', import.meta.url));
const agentLogNoop = fileURLToPath(new URL('./src/sortable/agent-log.noop.ts', import.meta.url));

export default defineConfig({
	tsconfig: './tsconfig.build.json',
	entry: {
		index: './src/index.ts',
		internal: './src/internal.ts',
		'draggable/index': './src/draggable/index.ts',
		'resizable/index': './src/resizable/index.ts',
		plugins: './src/plugins.ts',
		presets: './src/presets.ts',
		'drop/index': './src/drop/index.ts',
		'drop/plugins': './src/drop-plugins.ts',
		'sortable/index': './src/sortable/index.ts',
		'testing/index': './src/testing/index.ts',
		'dev/index': './src/dev/index.ts',
		'sensors/index': './src/sensors/index.ts',
		'interaction/index': './src/interaction-input.ts',
		'a11y/index': './src/a11y/index.ts',
		'resize/index': './src/resize/index.ts',
	},
	format: 'esm',
	dts: { resolve: true },
	clean: true,
	platform: 'browser',
	treeshake: { moduleSideEffects: false },
	alias: {
		[agentLog]: agentLogNoop,
	},
});
