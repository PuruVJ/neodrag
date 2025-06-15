import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { build } from 'tsup';
import { fileURLToPath } from 'node:url';
import { sync } from 'brotli-size';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Default plugins that are always included in DraggableFactory
const DEFAULT_PLUGINS = [
	'ignoreMultitouch',
	'stateMarker',
	'applyUserSelectHack',
	'transform',
	'threshold',
	'touchAction',
];

// Global export mapping
let exportKeyMap: Record<string, number> = {};
let reverseKeyMap: Record<number, string> = {};

function createKeyMap(exports: string[]): void {
	exports.forEach((exportName, index) => {
		exportKeyMap[exportName] = index;
		reverseKeyMap[index] = exportName;
	});
}

// Convert combination to bitmask
function combinationToBitmask(combination: string[]): number {
	let bitmask = 0;
	for (const plugin of combination) {
		const pluginIndex = exportKeyMap[plugin];
		bitmask |= 1 << pluginIndex;
	}
	return bitmask;
}

async function setupCoreEnvironment() {
	const tempDir = resolve(__dirname, 'temp', 'core-analysis');
	mkdirSync(tempDir, { recursive: true });

	const corePackagePath = resolve(__dirname, '../../packages/core');
	const nodeModulesDir = join(tempDir, 'node_modules', '@neodrag');
	mkdirSync(nodeModulesDir, { recursive: true });

	const coreDistPath = join(corePackagePath, 'dist');
	const coreTargetPath = join(nodeModulesDir, 'core');
	mkdirSync(coreTargetPath, { recursive: true });

	if (existsSync(coreDistPath)) {
		const coreFiles = readdirSync(coreDistPath);
		for (const file of coreFiles) {
			const sourcePath = join(coreDistPath, file);
			const targetPath = join(coreTargetPath, file);
			const content = readFileSync(sourcePath, 'utf8');
			writeFileSync(targetPath, content);
		}

		const corePackageJson = {
			name: '@neodrag/core',
			main: 'index.js',
			module: 'index.js',
			type: 'module',
			sideEffects: false,
			exports: {
				'.': './index.js',
				'./plugins': './plugins.js',
			},
		};
		writeFileSync(join(coreTargetPath, 'package.json'), JSON.stringify(corePackageJson, null, 2));
	}

	return tempDir;
}

function getCorePluginExports(): string[] {
	try {
		const corePackagePath = resolve(__dirname, '../../packages/core');
		const corePluginsPath = join(corePackagePath, 'dist', 'plugins.js');

		if (existsSync(corePluginsPath)) {
			const corePluginsContent = readFileSync(corePluginsPath, 'utf-8');
			return extractExportsFromContent(corePluginsContent);
		}

		// Fallback: try to read from src if dist doesn't exist
		const corePluginsSrcPath = join(corePackagePath, 'src', 'plugins.ts');
		if (existsSync(corePluginsSrcPath)) {
			const corePluginsContent = readFileSync(corePluginsSrcPath, 'utf-8');
			return extractExportsFromContent(corePluginsContent);
		}
	} catch (error) {
		// @ts-ignore
		console.warn(`Could not read core plugins: ${error.message}`);
	}

	return [];
}

function extractExportsFromContent(jsContent: string): string[] {
	const exports: string[] = [];

	// Pattern 1: export { name1, name2, name3 }
	const namedExportPattern = /export\s*\{\s*([^}]+)\s*\}/g;
	let match;
	while ((match = namedExportPattern.exec(jsContent)) !== null) {
		const exportList = match[1];
		const names = exportList
			.split(',')
			.map((name) => {
				const parts = name.trim().split(/\s+as\s+/);
				return parts[0].trim().replace(/["']/g, '');
			})
			.filter(Boolean);
		exports.push(...names);
	}

	// Pattern 2: export const/let/var/function/class name
	const directExportPattern =
		/export\s+(?:const|let|var|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
	while ((match = directExportPattern.exec(jsContent)) !== null) {
		exports.push(match[1]);
	}

	return [...new Set(exports)].filter((exp) => exp !== 'default' && exp.length > 0);
}

function* generateAllCombinations<T>(arr: T[], maxCombinations = Infinity): Generator<T[]> {
	const n = arr.length;
	let count = 0;

	for (let i = 0; i < Math.pow(2, n) && count < maxCombinations; i++) {
		const combination = [];
		for (let j = 0; j < n; j++) {
			if (i & (1 << j)) {
				combination.push(arr[j]);
			}
		}
		yield combination;
		count++;
	}
}

function getActualImportsForCombination(plugins: string[]): {
	actualImports: string[];
	usedInFactory: string[];
} {
	// Remove BoundsFrom and ControlFrom from plugins if they're there
	const cleanPlugins = plugins.filter((p) => p !== 'BoundsFrom' && p !== 'ControlFrom');
	const actualImports = [...cleanPlugins];
	const usedInFactory = [...cleanPlugins];

	// Only include BoundsFrom if bounds is in the combination
	if (cleanPlugins.includes('bounds')) {
		actualImports.push('BoundsFrom');
		usedInFactory.push('BoundsFrom');
	}

	// Only include ControlFrom if controls is in the combination
	if (cleanPlugins.includes('controls')) {
		actualImports.push('ControlFrom');
		usedInFactory.push('ControlFrom');
	}

	return { actualImports, usedInFactory };
}

function isSubsetOfDefaults(plugins: string[]): boolean {
	return plugins.every((plugin) => DEFAULT_PLUGINS.includes(plugin));
}

async function measureCombinationWithBuild(
	keyPlugins: string[], // Plugins for the key
	tempDir: string,
	baseSize: number,
): Promise<number> {
	const measureDir = resolve(__dirname, 'temp', 'measure');
	mkdirSync(measureDir, { recursive: true });

	// Copy core package
	const nodeModulesSource = join(tempDir, 'node_modules');
	if (existsSync(nodeModulesSource)) {
		const nodeModulesTarget = join(measureDir, 'node_modules');
		mkdirSync(nodeModulesTarget, { recursive: true });
		copyRecursive(nodeModulesSource, nodeModulesTarget);
	}

	// Get actual imports (including BoundsFrom/ControlFrom if needed)
	const { actualImports } = getActualImportsForCombination(keyPlugins);

	const testContent = `
import { DraggableFactory } from '@neodrag/core';
import { ${actualImports.join(', ')} } from '@neodrag/core/plugins';

export const factory = DraggableFactory(${actualImports.join(',')});
`;

	const entryPath = join(measureDir, 'test.js');
	writeFileSync(entryPath, testContent);

	const packageJson = {
		name: 'core-analysis',
		type: 'module',
	};
	writeFileSync(join(measureDir, 'package.json'), JSON.stringify(packageJson, null, 2));

	const outDir = resolve(__dirname, 'temp', 'build-output');
	if (existsSync(outDir)) {
		rmSync(outDir, { recursive: true, force: true });
	}
	mkdirSync(outDir, { recursive: true });

	try {
		const safeFilename =
			`core-${Date.now()}-${keyPlugins.join('-').replace(/[^a-zA-Z0-9-]/g, '_')}`.slice(0, 100);

		await build({
			entry: { [safeFilename]: entryPath },
			format: ['esm'],
			outDir,
			bundle: true,
			target: 'es2020',
			treeshake: {
				preset: 'smallest',
				moduleSideEffects: false,
			},
			minify: 'terser',
			terserOptions: {
				compress: {
					dead_code: true,
					drop_console: true,
					unused: true,
				},
				mangle: { toplevel: true },
			},
			clean: false,
			noExternal: ['@neodrag/core'],
			silent: true,
		});

		const outputPath = join(outDir, `${safeFilename}.js`);
		const content = readFileSync(outputPath, 'utf-8');
		const size = sync(content);

		// Cleanup
		rmSync(measureDir, { recursive: true, force: true });

		return size;
	} catch (error) {
		console.warn(
			// @ts-ignore
			`    ❌ Build failed for [${keyPlugins.join(', ')}]: ${error.message.split('\n')[0]}`,
		);
		return baseSize; // Return base size if build fails
	}
}

function copyRecursive(src: string, dest: string) {
	const entries = readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);
		if (entry.isDirectory()) {
			mkdirSync(destPath, { recursive: true });
			copyRecursive(srcPath, destPath);
		} else {
			writeFileSync(destPath, readFileSync(srcPath, 'utf8'));
		}
	}
}

function estimateSizeForDefaultCombination(plugins: string[], baseSize: number): number {
	// Estimate plugin sizes (these would be refined with actual measurements)
	const pluginEstimatedSizes: Record<string, number> = {
		ignoreMultitouch: 50,
		stateMarker: 80,
		applyUserSelectHack: 60,
		transform: 120,
		threshold: 90,
		touchAction: 40,
	};

	let estimatedSize = baseSize;
	let totalPluginSize = 0;

	for (const plugin of plugins) {
		totalPluginSize += pluginEstimatedSizes[plugin] || 50;
	}

	// Apply overlap reduction (shared utilities, etc.)
	const overlapReduction = plugins.length > 1 ? Math.min(totalPluginSize * 0.1, 100) : 0;
	estimatedSize += Math.max(0, totalPluginSize - overlapReduction);

	return Math.round(estimatedSize);
}

function cleanup() {
	try {
		rmSync(resolve(__dirname, 'temp'), { recursive: true, force: true });
	} catch {}
}

async function main() {
	cleanup();

	console.log('🚀 Starting Core Plugin Bundle Analysis (Bitmask Output)...\n');

	// Setup core environment
	const tempDir = await setupCoreEnvironment();
	console.log('✅ Core environment setup complete');

	// Get all available plugins and filter
	const allRawPlugins = getCorePluginExports();
	const excludedPlugins = [
		'Compartment',
		'unstable_definePlugin',
		'BoundsFrom',
		'ControlFrom',
		'resolve_plugins',
	];
	const allPlugins = allRawPlugins.filter((p) => !excludedPlugins.includes(p));

	console.log(`📦 Found ${allPlugins.length} plugins (after filtering): ${allPlugins.join(', ')}`);
	console.log(`🚫 Excluded: ${excludedPlugins.join(', ')}`);

	// Create key mapping
	createKeyMap(allPlugins);

	// Separate default and non-default plugins
	const defaultPlugins = allPlugins.filter((p) => DEFAULT_PLUGINS.includes(p));
	const nonDefaultPlugins = allPlugins.filter((p) => !DEFAULT_PLUGINS.includes(p));

	console.log(`🔧 Default plugins (${defaultPlugins.length}): ${defaultPlugins.join(', ')}`);
	console.log(
		`🔌 Non-default plugins (${nonDefaultPlugins.length}): ${nonDefaultPlugins.join(', ')}`,
	);

	// Measure base size (just DraggableFactory with no plugins)
	console.log('\n📏 Measuring base size...');
	const baseSize = await measureCombinationWithBuild([], tempDir, 0);
	console.log(`✅ Base DraggableFactory size: ${baseSize} bytes`);

	// Use object with string keys for JSON compatibility
	const sizes: Record<string, number> = {};

	// Generate ALL combinations and measure them
	console.log(`\n🧮 Generating combinations with bitmask keys...`);

	let total = 0;
	let calculated = 0;
	let built = 0;

	for (const combination of generateAllCombinations(allPlugins)) {
		// Generate bitmask and use as string key
		const bitmask = combinationToBitmask(combination);
		const bitmaskKey = bitmask.toString();

		total++;

		if (total % 1000 === 0) {
			console.log(
				`  🔄 Progress: ${total}/${Math.pow(2, allPlugins.length)} combinations processed`,
			);
		}

		if (combination.length === 0) {
			// Base case
			sizes[bitmaskKey] = baseSize;
			calculated++;
		} else if (isSubsetOfDefaults(combination)) {
			// Default plugin combination - calculate in memory
			sizes[bitmaskKey] = estimateSizeForDefaultCombination(combination, baseSize);
			calculated++;
		} else {
			// Non-default combination - build it
			const size = await measureCombinationWithBuild(combination, tempDir, baseSize);
			sizes[bitmaskKey] = size;
			built++;

			if (built % 50 === 0) {
				console.log(`    🔨 Built ${built} non-default combinations so far...`);
			}
		}
	}

	console.log(`\n✅ Processing complete:`);
	console.log(`  📊 Total combinations: ${total}`);
	console.log(`  🧮 Calculated in memory: ${calculated}`);
	console.log(`  🔨 Built with tsup: ${built}`);

	// Prepare final output (same structure as before, but with bitmask keys)
	const output = {
		keys: reverseKeyMap,
		sizes,
	};

	// Write results to same file as before
	const sizesPath = new URL('../src/sizes.json', import.meta.url);
	writeFileSync(sizesPath, JSON.stringify(output, null, 2));
	console.log(`\n✅ Wrote sizes.json with ${Object.keys(sizes).length} bitmask-based combinations`);

	// Summary
	console.log('\n📈 CORE PLUGIN BUNDLE SIZE ANALYSIS:');
	console.log(`  🎯 Base size: ${baseSize} bytes`);

	const sizeEntries = Object.entries(sizes).sort((a, b) => a[1] - b[1]);
	if (sizeEntries.length > 0) {
		const minSize = sizeEntries[0][1];
		const maxSize = sizeEntries[sizeEntries.length - 1][1];
		console.log(`  📏 Size range: ${minSize} - ${maxSize} bytes`);

		// Show size distribution by plugin count
		const byPluginCount = new Map<number, number[]>();
		sizeEntries.forEach(([bitmaskStr, size]) => {
			const bitmask = parseInt(bitmaskStr);
			const pluginCount = bitmask === 0 ? 0 : bitmask.toString(2).split('1').length - 1;
			if (!byPluginCount.has(pluginCount)) {
				byPluginCount.set(pluginCount, []);
			}
			byPluginCount.get(pluginCount)!.push(size);
		});

		console.log(`  📈 Size by plugin count:`);
		Array.from(byPluginCount.entries())
			.sort((a, b) => a[0] - b[0])
			.forEach(([count, sizesForCount]) => {
				const avgSize = Math.round(sizesForCount.reduce((a, b) => a + b, 0) / sizesForCount.length);
				const minSizeForCount = Math.min(...sizesForCount);
				const maxSizeForCount = Math.max(...sizesForCount);
				const avgOverhead = count === 0 ? 0 : avgSize - baseSize;

				console.log(
					`    ${count === 0 ? 'Base only' : count + ' plugins'}: ${sizesForCount.length} combos, avg ${avgSize}b (+${avgOverhead}b), range ${minSizeForCount}-${maxSizeForCount}b`,
				);
			});

		// Show most efficient combinations
		console.log(`\n🏆 Most efficient plugin combinations:`);
		const pluginEntries = sizeEntries.filter(([bitmaskStr]) => bitmaskStr !== '0');
		pluginEntries.slice(0, 5).forEach(([bitmaskStr, size]) => {
			const bitmask = parseInt(bitmaskStr);
			const plugins = [];
			for (let i = 0; i < 14; i++) {
				if (bitmask & (1 << i)) {
					plugins.push(reverseKeyMap[i]);
				}
			}
			const overhead = size - baseSize;
			const overheadPercent = Math.round((overhead / baseSize) * 100);
			console.log(
				`    +${overhead.toString().padStart(4)} bytes (+${overheadPercent.toString().padStart(2)}%): [${plugins.join(', ')}] (bitmask: ${bitmask})`,
			);
		});
	}

	cleanup();
	console.log('\n🎉 Core analysis complete!');
}

await main().catch(console.error);
