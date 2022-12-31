import { CompileOptions, ResolvedOptions } from './options';
import { compile, preprocess, walk } from 'svelte/compiler';
// @ts-ignore
import { createMakeHot } from 'svelte-hmr';
import { SvelteRequest } from './id';
import { safeBase64Hash } from './hash';
import { log } from './log';
import { StatCollection } from './vite-plugin-svelte-stats';
//eslint-disable-next-line node/no-missing-import
import type { Processed } from 'svelte/types/compiler/preprocess';
import { createInjectScopeEverythingRulePreprocessorGroup } from './preprocess';
import path from 'path';

const scriptLangRE = /<script [^>]*lang=["']?([^"' >]+)["']?[^>]*>/;

export type CompileSvelte = ReturnType<typeof _createCompileSvelte>;

function mapSourcesToRelative(map: { sources?: string[] }, filename: string) {
	// sourcemap sources are relative to the sourcemap itself
	// assume the sourcemap location is the same as filename and turn absolute paths to relative
	// to avoid leaking fs information like vite root
	if (map?.sources) {
		map.sources = map.sources.map((s) => {
			if (path.isAbsolute(s)) {
				const relative = path.relative(filename, s);
				// empty string a source is not allowed, use simple filename
				return relative === '' ? path.basename(filename) : relative;
			} else {
				return s;
			}
		});
	}
}

const _createCompileSvelte = (makeHot: Function) => {
	let stats: StatCollection | undefined;
	const devStylePreprocessor = createInjectScopeEverythingRulePreprocessorGroup();
	return async function compileSvelte(
		svelteRequest: SvelteRequest,
		code: string,
		options: Partial<ResolvedOptions>
	): Promise<CompileData> {
		const { filename, normalizedFilename, cssId, ssr, raw } = svelteRequest;
		const { emitCss = true } = options;
		const dependencies = [];

		if (options.stats) {
			if (options.isBuild) {
				if (!stats) {
					// build is either completely ssr or csr, create stats collector on first compile
					// it is then finished in the buildEnd hook.
					stats = options.stats.startCollection(`${ssr ? 'ssr' : 'dom'} compile`, {
						logInProgress: () => false
					});
				}
			} else {
				// dev time ssr, it's a ssr request and there are no stats, assume new page load and start collecting
				if (ssr && !stats) {
					stats = options.stats.startCollection('ssr compile');
				}
				// stats are being collected but this isn't an ssr request, assume page loaded and stop collecting
				if (!ssr && stats) {
					stats.finish();
					stats = undefined;
				}
				// TODO find a way to trace dom compile during dev
				// problem: we need to call finish at some point but have no way to tell if page load finished
				// also they for hmr updates too
			}
		}

		const compileOptions: CompileOptions = {
			...options.compilerOptions,
			filename: normalizedFilename, // use normalized here to avoid bleeding absolute fs path
			generate: ssr ? 'ssr' : 'dom',
			format: 'esm'
		};
		if (options.hot && options.emitCss) {
			const hash = `s-${safeBase64Hash(normalizedFilename)}`;
			log.debug(`setting cssHash ${hash} for ${normalizedFilename}`);
			compileOptions.cssHash = () => hash;
		}
		if (ssr && compileOptions.enableSourcemap !== false) {
			if (typeof compileOptions.enableSourcemap === 'object') {
				compileOptions.enableSourcemap.css = false;
			} else {
				compileOptions.enableSourcemap = { js: true, css: false };
			}
		}

		let preprocessed;
		let preprocessors = options.preprocess;
		if (!options.isBuild && options.emitCss && options.hot) {
			// inject preprocessor that ensures css hmr works better
			if (!Array.isArray(preprocessors)) {
				preprocessors = preprocessors
					? [preprocessors, devStylePreprocessor]
					: [devStylePreprocessor];
			} else {
				preprocessors = preprocessors.concat(devStylePreprocessor);
			}
		}
		if (preprocessors) {
			try {
				preprocessed = await preprocess(code, preprocessors, { filename }); // full filename here so postcss works
			} catch (e) {
				e.message = `Error while preprocessing ${filename}${e.message ? ` - ${e.message}` : ''}`;
				throw e;
			}

			if (preprocessed.dependencies) dependencies.push(...preprocessed.dependencies);
			if (preprocessed.map) compileOptions.sourcemap = preprocessed.map;
		}
		if (typeof preprocessed?.map === 'object') {
			mapSourcesToRelative(preprocessed?.map, filename);
		}
		if (raw && svelteRequest.query.type === 'preprocessed') {
			// shortcut
			return { preprocessed: preprocessed ?? { code } } as CompileData;
		}
		const finalCode = preprocessed ? preprocessed.code : code;
		const dynamicCompileOptions = await options.experimental?.dynamicCompileOptions?.({
			filename,
			code: finalCode,
			compileOptions
		});
		if (dynamicCompileOptions && log.debug.enabled) {
			log.debug(
				`dynamic compile options for  ${filename}: ${JSON.stringify(dynamicCompileOptions)}`
			);
		}
		const finalCompileOptions = dynamicCompileOptions
			? {
					...compileOptions,
					...dynamicCompileOptions
			  }
			: compileOptions;

		const endStat = stats?.start(filename);
		const compiled = compile(finalCode, finalCompileOptions);
		if (endStat) {
			endStat();
		}
		mapSourcesToRelative(compiled.js?.map, filename);
		mapSourcesToRelative(compiled.css?.map, filename);
		if (!raw) {
			// wire css import and code for hmr
			const hasCss = compiled.css?.code?.trim().length > 0;
			// compiler might not emit css with mode none or it may be empty
			if (emitCss && hasCss) {
				// TODO properly update sourcemap?
				compiled.js.code += `\nimport ${JSON.stringify(cssId)};\n`;
			}

			// only apply hmr when not in ssr context and hot options are set
			if (!ssr && makeHot) {
				compiled.js.code = makeHot({
					id: filename,
					compiledCode: compiled.js.code,
					//@ts-expect-error hot isn't a boolean at this point
					hotOptions: { ...options.hot, injectCss: options.hot?.injectCss === true && hasCss },
					compiled,
					originalCode: code,
					compileOptions: finalCompileOptions
				});
			}
		}

		compiled.js.dependencies = dependencies;

		return {
			filename,
			normalizedFilename,
			lang: code.match(scriptLangRE)?.[1] || 'js',
			// @ts-ignore
			compiled,
			ssr,
			dependencies,
			preprocessed: preprocessed ?? { code }
		};
	};
};
function buildMakeHot(options: ResolvedOptions) {
	const needsMakeHot = options.hot !== false && options.isServe && !options.isProduction;
	if (needsMakeHot) {
		// @ts-ignore
		const hotApi = options?.hot?.hotApi;
		// @ts-ignore
		const adapter = options?.hot?.adapter;
		return createMakeHot({
			walk,
			hotApi,
			adapter,
			hotOptions: { noOverlay: true, ...(options.hot as object) }
		});
	}
}

export function createCompileSvelte(options: ResolvedOptions) {
	const makeHot = buildMakeHot(options);
	return _createCompileSvelte(makeHot);
}

export interface Code {
	code: string;
	map?: any;
	dependencies?: any[];
}

export interface Compiled {
	js: Code;
	css: Code;
	ast: any; // TODO type
	warnings: any[]; // TODO type
	vars: {
		name: string;
		export_name: string;
		injected: boolean;
		module: boolean;
		mutated: boolean;
		reassigned: boolean;
		referenced: boolean;
		writable: boolean;
		referenced_from_script: boolean;
	}[];
	stats: {
		timings: {
			total: number;
		};
	};
}

export interface CompileData {
	filename: string;
	normalizedFilename: string;
	lang: string;
	compiled: Compiled;
	ssr: boolean | undefined;
	dependencies: string[];
	preprocessed: Processed;
}
