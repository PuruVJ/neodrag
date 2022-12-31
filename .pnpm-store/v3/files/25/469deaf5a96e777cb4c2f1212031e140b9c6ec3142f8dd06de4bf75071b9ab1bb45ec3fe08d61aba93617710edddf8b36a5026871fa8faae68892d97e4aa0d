import { readFileSync } from 'fs';
import { compile, preprocess } from 'svelte/compiler';
import { DepOptimizationOptions } from 'vite';
import { Compiled } from './compile';
import { log } from './log';
import { CompileOptions, ResolvedOptions } from './options';
import { toESBuildError } from './error';
import { StatCollection } from './vite-plugin-svelte-stats';

type EsbuildOptions = NonNullable<DepOptimizationOptions['esbuildOptions']>;
type EsbuildPlugin = NonNullable<EsbuildOptions['plugins']>[number];

export const facadeEsbuildSveltePluginName = 'vite-plugin-svelte:facade';

export function esbuildSveltePlugin(options: ResolvedOptions): EsbuildPlugin {
	return {
		name: 'vite-plugin-svelte:optimize-svelte',
		setup(build) {
			// Skip in scanning phase as Vite already handles scanning Svelte files.
			// Otherwise this would heavily slow down the scanning phase.
			if (build.initialOptions.plugins?.some((v) => v.name === 'vite:dep-scan')) return;

			const svelteExtensions = (options.extensions ?? ['.svelte']).map((ext) => ext.slice(1));
			const svelteFilter = new RegExp(`\\.(` + svelteExtensions.join('|') + `)(\\?.*)?$`);
			let statsCollection: StatCollection | undefined;
			build.onStart(() => {
				statsCollection = options.stats?.startCollection('prebundle libraries', {
					logResult: (c) => c.stats.length > 1
				});
			});
			build.onLoad({ filter: svelteFilter }, async ({ path: filename }) => {
				const code = readFileSync(filename, 'utf8');
				try {
					const contents = await compileSvelte(options, { filename, code }, statsCollection);
					return { contents };
				} catch (e) {
					return { errors: [toESBuildError(e, options)] };
				}
			});
			build.onEnd(() => {
				statsCollection?.finish();
			});
		}
	};
}

async function compileSvelte(
	options: ResolvedOptions,
	{ filename, code }: { filename: string; code: string },
	statsCollection?: StatCollection
): Promise<string> {
	let css = options.compilerOptions.css;
	if (css !== 'none') {
		// TODO ideally we'd be able to externalize prebundled styles too, but for now always put them in the js
		css = 'injected';
	}
	const compileOptions: CompileOptions = {
		...options.compilerOptions,
		css,
		filename,
		format: 'esm',
		generate: 'dom'
	};

	let preprocessed;

	if (options.preprocess) {
		try {
			preprocessed = await preprocess(code, options.preprocess, { filename });
		} catch (e) {
			e.message = `Error while preprocessing ${filename}${e.message ? ` - ${e.message}` : ''}`;
			throw e;
		}
		if (preprocessed.map) compileOptions.sourcemap = preprocessed.map;
	}

	const finalCode = preprocessed ? preprocessed.code : code;

	const dynamicCompileOptions = await options.experimental?.dynamicCompileOptions?.({
		filename,
		code: finalCode,
		compileOptions
	});

	if (dynamicCompileOptions && log.debug.enabled) {
		log.debug(`dynamic compile options for  ${filename}: ${JSON.stringify(dynamicCompileOptions)}`);
	}

	const finalCompileOptions = dynamicCompileOptions
		? {
				...compileOptions,
				...dynamicCompileOptions
		  }
		: compileOptions;
	const endStat = statsCollection?.start(filename);
	const compiled = compile(finalCode, finalCompileOptions) as Compiled;
	if (endStat) {
		endStat();
	}
	return compiled.js.code + '//# sourceMappingURL=' + compiled.js.map.toUrl();
}
