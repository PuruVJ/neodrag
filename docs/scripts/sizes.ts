import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { build } from 'tsdown';
import { fileURLToPath } from 'node:url';
import { sync } from 'brotli-size';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const DRAG_DEFAULTS = [
	'ignoreMultitouch',
	'applyUserSelectHack',
	'threshold()',
	'touchAction',
] as const;

const DRAG_OPTIONAL = [
	'axis',
	'grid',
	'bounds',
	'position',
	'disabled',
	'controls',
	'scrollLock',
	'ghost',
	'dragData',
] as const;

const DROP_OPTIONAL = ['accepts', 'highlight', 'onDrop'] as const;

const PLUGIN_EXPR: Record<string, string> = {
	ignoreMultitouch: 'ignoreMultitouch',
	applyUserSelectHack: 'applyUserSelectHack',
	touchAction: 'touchAction',
	threshold: 'threshold()',
	axis: 'axis()',
	grid: 'grid([10, 10])',
	bounds: 'bounds()',
	position: 'position()',
	disabled: 'disabled()',
	controls: 'controls()',
	scrollLock: 'scrollLock()',
	ghost: 'ghost()',
	dragData: 'dragData(() => null)',
	accepts: 'accepts(() => true)',
	highlight: 'highlight()',
	onDrop: 'onDrop(() => {})',
};

type KeyMap = Record<string, string>;

export type SizesOutput = {
	version: 2;
	generatedAt: string;
	drag: { keys: KeyMap; sizes: Record<string, number> };
	drop: { keys: KeyMap; sizes: Record<string, number> };
	extras: {
		engineMinimal: number;
		sortable: number;
		draggableOnly: number;
		rotatable: number;
	};
	presets: Record<string, { bytes: number; drag: string[]; drop: string[]; label: string }>;
};

function createKeyMap(exports: readonly string[]): {
	keys: KeyMap;
	reverse: Record<number, string>;
} {
	const keys: KeyMap = {};
	const reverse: Record<number, string> = {};
	exports.forEach((name, index) => {
		keys[String(index)] = name;
		reverse[index] = name;
	});
	return { keys, reverse };
}

function combinationToBitmask(combination: readonly string[], keyMap: KeyMap): number {
	let bitmask = 0;
	for (const name of combination) {
		const index = Number(Object.entries(keyMap).find(([, v]) => v === name)?.[0]);
		if (!Number.isNaN(index)) bitmask |= 1 << index;
	}
	return bitmask;
}

function* allCombinations<T>(items: readonly T[]): Generator<T[]> {
	const n = items.length;
	for (let i = 0; i < 1 << n; i++) {
		const combo: T[] = [];
		for (let j = 0; j < n; j++) {
			if (i & (1 << j)) combo.push(items[j]!);
		}
		yield combo;
	}
}

function copyRecursive(src: string, dest: string) {
	for (const entry of readdirSync(src, { withFileTypes: true })) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);
		if (entry.isDirectory()) {
			mkdirSync(destPath, { recursive: true });
			copyRecursive(srcPath, destPath);
		} else {
			writeFileSync(destPath, readFileSync(srcPath));
		}
	}
}

async function setupCoreEnvironment(tempDir: string) {
	const coreDist = resolve(__dirname, '../../packages/core/dist');
	const target = join(tempDir, 'node_modules', '@neodrag', 'core');
	mkdirSync(target, { recursive: true });

	if (!existsSync(coreDist)) {
		throw new Error('Run `pnpm compile` in packages/core before `pnpm sizes` in docs/scripts');
	}

	copyRecursive(coreDist, target);

	writeFileSync(
		join(target, 'package.json'),
		JSON.stringify(
			{
				name: '@neodrag/core',
				type: 'module',
				sideEffects: false,
				exports: {
					'.': './index.js',
					'./internal': './internal.js',
					'./plugins': './plugins.js',
					'./drop': './drop/index.js',
					'./drop/plugins': './drop/plugins.js',
					'./sortable': './sortable/index.js',
					'./resize': './resize/index.js',
					'./rotate': './rotate/index.js',
					'./draggable': './draggable/index.js',
					'./resizable': './resizable/index.js',
					'./presets': './presets.js',
				},
			},
			null,
			2,
		),
	);
}

async function measureEntry(tempDir: string, filename: string, content: string): Promise<number> {
	const measureDir = join(tempDir, 'measure');
	const outDir = join(tempDir, 'out');
	mkdirSync(measureDir, { recursive: true });
	mkdirSync(outDir, { recursive: true });

	copyRecursive(join(tempDir, 'node_modules'), join(measureDir, 'node_modules'));

	const entryPath = join(measureDir, 'entry.js');
	writeFileSync(entryPath, content);
	writeFileSync(join(measureDir, 'package.json'), JSON.stringify({ type: 'module' }, null, 2));

	await build({
		entry: { [filename]: entryPath },
		format: ['esm'],
		outDir,
		target: 'es2020',
		platform: 'browser',
		treeshake: { moduleSideEffects: false },
		minify: true,
		clean: true,
		dts: false,
		deps: {
			alwaysBundle: [
				'@neodrag/core',
				'@neodrag/core/internal',
				'@neodrag/core/plugins',
				'@neodrag/core/drop',
				'@neodrag/core/sortable',
				'@neodrag/core/rotate',
				'@neodrag/core/draggable',
			],
		},
		logLevel: 'silent',
	});

	const bundle = readFileSync(join(outDir, `${filename}.js`), 'utf-8');
	rmSync(measureDir, { recursive: true, force: true });
	return sync(bundle);
}

async function measureDragCombo(tempDir: string, optional: readonly string[]): Promise<number> {
	const imports = new Set<string>();
	for (const name of optional) imports.add(name);

	const importList = [...imports].sort().join(', ');
	const pluginList = [...DRAG_DEFAULTS, ...optional.map((n) => PLUGIN_EXPR[n] ?? `${n}()`)];

	const importBlock =
		importList.length > 0 ? `import { ${importList} } from '@neodrag/core/plugins';\n` : '';

	return measureEntry(
		tempDir,
		`drag-${optional.join('-') || 'defaults'}`,
		`${importBlock}import { Neodrag } from '@neodrag/core';

const engine = new Neodrag({ plugins: [${pluginList.join(', ')}] });
export { engine };
`,
	);
}

async function measureDropCombo(tempDir: string, optional: readonly string[]): Promise<number> {
	const importList = optional.length > 0 ? optional.join(', ') : '';
	const pluginList =
		optional.length > 0 ? optional.map((n) => PLUGIN_EXPR[n] ?? `${n}()`).join(', ') : '';

	const importBlock =
		optional.length > 0
			? `import { ${importList} } from '@neodrag/core/drop';\n`
			: `import '@neodrag/core/drop';\n`;

	const dropLine =
		optional.length > 0
			? `engine.droppable(node, [${pluginList}]);`
			: `engine.droppable(node, []);`;

	return measureEntry(
		tempDir,
		`drop-${optional.join('-') || 'none'}`,
		`${importBlock}import { Neodrag } from '@neodrag/core';

const engine = new Neodrag();
const node = typeof document !== 'undefined' ? document.createElement('div') : {};
${dropLine}
export { engine };
`,
	);
}

async function measureExtras(tempDir: string) {
	const engineMinimal = await measureEntry(
		tempDir,
		'minimal',
		`import { DragNeodrag } from '@neodrag/core/internal';
export const engine = new DragNeodrag({ plugins: [], defaultSensors: false });
`,
	);

	const draggableOnly = await measureEntry(
		tempDir,
		'draggable-only',
		`import { Draggable } from '@neodrag/core/draggable';
import { position } from '@neodrag/core/plugins';
const binding = new Draggable({ plugins: [position({ current: { x: 0, y: 0 } })] });
export { binding };
`,
	);

	const sortable = await measureEntry(
		tempDir,
		'sortable',
		`import { Neodrag } from '@neodrag/core';
import { Sortable } from '@neodrag/core/sortable';

const engine = new Neodrag();
const list = typeof document !== 'undefined' ? document.createElement('ul') : {};
const plugins = new Sortable({ items: () => [], keyBy: (i) => i.id, onReorder: () => {} });
export { engine, plugins };
`,
	);

	const rotatable = await measureEntry(
		tempDir,
		'rotatable',
		`import { Rotatable } from '@neodrag/core/rotate';
const node = typeof document !== 'undefined' ? document.createElement('div') : {};
const binding = new Rotatable(node, { origin: 'center' });
export { binding };
`,
	);

	return { engineMinimal, sortable, draggableOnly, rotatable };
}

async function main() {
	const tempDir = resolve(__dirname, 'temp');
	rmSync(tempDir, { recursive: true, force: true });
	mkdirSync(tempDir, { recursive: true });

	console.log('Setting up @neodrag/core dist…');
	await setupCoreEnvironment(tempDir);

	const dragMap = createKeyMap(DRAG_OPTIONAL);
	const dropMap = createKeyMap(DROP_OPTIONAL);
	const dragSizes: Record<string, number> = {};
	const dropSizes: Record<string, number> = {};

	console.log(`Measuring drag combinations (${1 << DRAG_OPTIONAL.length})…`);
	let i = 0;
	for (const combo of allCombinations(DRAG_OPTIONAL)) {
		const mask = combinationToBitmask(combo, dragMap.keys);
		dragSizes[String(mask)] = await measureDragCombo(tempDir, combo);
		i++;
		if (i % 64 === 0) console.log(`  drag ${i}/${1 << DRAG_OPTIONAL.length}`);
	}

	console.log(`Measuring drop combinations (${1 << DROP_OPTIONAL.length})…`);
	i = 0;
	for (const combo of allCombinations(DROP_OPTIONAL)) {
		const mask = combinationToBitmask(combo, dropMap.keys);
		dropSizes[String(mask)] = await measureDropCombo(tempDir, combo);
		i++;
		if (i % 4 === 0) console.log(`  drop ${i}/${1 << DROP_OPTIONAL.length}`);
	}

	console.log('Measuring extras…');
	const extras = await measureExtras(tempDir);

	const presets: SizesOutput['presets'] = {
		defaults: {
			label: 'Default drag stack',
			bytes: dragSizes['0'] ?? 0,
			drag: [],
			drop: [],
		},
		minimal: {
			label: 'Engine only (plugins: [])',
			bytes: extras.engineMinimal,
			drag: [],
			drop: [],
		},
		axisGrid: {
			label: 'Defaults + axis + grid',
			bytes: dragSizes[String(combinationToBitmask(['axis', 'grid'], dragMap.keys))] ?? 0,
			drag: ['axis', 'grid'],
			drop: [],
		},
		dropBasic: {
			label: 'Defaults + accepts + onDrop',
			bytes:
				(dragSizes['0'] ?? 0) +
				Math.max(
					0,
					(dropSizes[String(combinationToBitmask(['accepts', 'onDrop'], dropMap.keys))] ?? 0) -
						(dropSizes['0'] ?? 0),
				),
			drag: [],
			drop: ['accepts', 'onDrop'],
		},
		sortableList: {
			label: 'Defaults + sortable list',
			bytes: (dragSizes['0'] ?? 0) + Math.max(0, extras.sortable - extras.engineMinimal),
			drag: [],
			drop: [],
		},
	};

	const output: SizesOutput = {
		version: 2,
		generatedAt: new Date().toISOString(),
		drag: { keys: dragMap.keys, sizes: dragSizes },
		drop: { keys: dropMap.keys, sizes: dropSizes },
		extras,
		presets,
	};

	const outPath = resolve(__dirname, '../src/sizes.json');
	writeFileSync(outPath, JSON.stringify(output));
	console.log(`Wrote ${outPath}`);
	console.log(`  drag base (defaults only): ${dragSizes['0']} B brotli`);
	console.log(`  engine minimal: ${extras.engineMinimal} B`);
	console.log(`  sortable helper: ${extras.sortable} B`);
	console.log(`  draggable only: ${extras.draggableOnly} B`);
	console.log(`  rotatable only: ${extras.rotatable} B`);

	rmSync(tempDir, { recursive: true, force: true });
}

await main().catch((err) => {
	console.error(err);
	process.exit(1);
});
