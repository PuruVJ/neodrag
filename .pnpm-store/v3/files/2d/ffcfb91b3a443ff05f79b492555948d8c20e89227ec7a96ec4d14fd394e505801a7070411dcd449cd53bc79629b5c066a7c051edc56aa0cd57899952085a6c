/* eslint-disable no-unused-vars */
import { ConfigEnv, ResolvedConfig, UserConfig, ViteDevServer, normalizePath } from 'vite';
import { log } from './log';
import { loadSvelteConfig } from './load-svelte-config';
import {
	SVELTE_EXPORT_CONDITIONS,
	SVELTE_HMR_IMPORTS,
	SVELTE_IMPORTS,
	SVELTE_RESOLVE_MAIN_FIELDS
} from './constants';
// eslint-disable-next-line node/no-missing-import
import type { CompileOptions, Warning } from 'svelte/types/compiler/interfaces';
import type {
	MarkupPreprocessor,
	Preprocessor,
	PreprocessorGroup,
	Processed
	// eslint-disable-next-line node/no-missing-import
} from 'svelte/types/compiler/preprocess';

import path from 'path';
import { esbuildSveltePlugin, facadeEsbuildSveltePluginName } from './esbuild';
import { addExtraPreprocessors } from './preprocess';
import deepmerge from 'deepmerge';
import {
	crawlFrameworkPkgs,
	isDepExcluded,
	isDepExternaled,
	isDepIncluded,
	isDepNoExternaled
	// eslint-disable-next-line node/no-missing-import
} from 'vitefu';
import { atLeastSvelte } from './svelte-version';
import { isCommonDepWithoutSvelteField } from './dependencies';
import { VitePluginSvelteStats } from './vite-plugin-svelte-stats';

// svelte 3.53.0 changed compilerOptions.css from boolean to string | boolen, use string when available
const cssAsString = atLeastSvelte('3.53.0');

const allowedPluginOptions = new Set([
	'include',
	'exclude',
	'emitCss',
	'hot',
	'ignorePluginPreprocessors',
	'disableDependencyReinclusion',
	'prebundleSvelteLibraries',
	'experimental'
]);

const knownRootOptions = new Set(['extensions', 'compilerOptions', 'preprocess', 'onwarn']);

const allowedInlineOptions = new Set([
	'configFile',
	'kit', // only for internal use by sveltekit
	...allowedPluginOptions,
	...knownRootOptions
]);

export function validateInlineOptions(inlineOptions?: Partial<Options>) {
	const invalidKeys = Object.keys(inlineOptions || {}).filter(
		(key) => !allowedInlineOptions.has(key)
	);
	if (invalidKeys.length) {
		log.warn(`invalid plugin options "${invalidKeys.join(', ')}" in inline config`, inlineOptions);
	}
}

function convertPluginOptions(config?: Partial<SvelteOptions>): Partial<Options> | undefined {
	if (!config) {
		return;
	}
	const invalidRootOptions = Object.keys(config).filter((key) => allowedPluginOptions.has(key));
	if (invalidRootOptions.length > 0) {
		throw new Error(
			`Invalid options in svelte config. Move the following options into 'vitePlugin:{...}': ${invalidRootOptions.join(
				', '
			)}`
		);
	}
	if (!config.vitePlugin) {
		return config;
	}
	const pluginOptions = config.vitePlugin;
	const pluginOptionKeys = Object.keys(pluginOptions);

	const rootOptionsInPluginOptions = pluginOptionKeys.filter((key) => knownRootOptions.has(key));
	if (rootOptionsInPluginOptions.length > 0) {
		throw new Error(
			`Invalid options in svelte config under vitePlugin:{...}', move them to the config root : ${rootOptionsInPluginOptions.join(
				', '
			)}`
		);
	}
	const duplicateOptions = pluginOptionKeys.filter((key) =>
		Object.prototype.hasOwnProperty.call(config, key)
	);
	if (duplicateOptions.length > 0) {
		throw new Error(
			`Invalid duplicate options in svelte config under vitePlugin:{...}', they are defined in root too and must only exist once: ${duplicateOptions.join(
				', '
			)}`
		);
	}
	const unknownPluginOptions = pluginOptionKeys.filter((key) => !allowedPluginOptions.has(key));
	if (unknownPluginOptions.length > 0) {
		log.warn(
			`ignoring unknown plugin options in svelte config under vitePlugin:{...}: ${unknownPluginOptions.join(
				', '
			)}`
		);
		unknownPluginOptions.forEach((unkownOption) => {
			// @ts-ignore
			delete pluginOptions[unkownOption];
		});
	}

	const result: Options = {
		...config,
		...pluginOptions
	};
	// @ts-expect-error it exists
	delete result.vitePlugin;

	return result;
}

// used in config phase, merges the default options, svelte config, and inline options
export async function preResolveOptions(
	inlineOptions: Partial<Options> = {},
	viteUserConfig: UserConfig,
	viteEnv: ConfigEnv
): Promise<PreResolvedOptions> {
	const viteConfigWithResolvedRoot: UserConfig = {
		...viteUserConfig,
		root: resolveViteRoot(viteUserConfig)
	};
	const isBuild = viteEnv.command === 'build';
	const defaultOptions: Partial<Options> = {
		extensions: ['.svelte'],
		emitCss: true,
		prebundleSvelteLibraries: !isBuild
	};
	const svelteConfig = convertPluginOptions(
		await loadSvelteConfig(viteConfigWithResolvedRoot, inlineOptions)
	);

	const extraOptions: Partial<PreResolvedOptions> = {
		root: viteConfigWithResolvedRoot.root!,
		isBuild,
		isServe: viteEnv.command === 'serve',
		isDebug: process.env.DEBUG != null
	};
	const merged = mergeConfigs<PreResolvedOptions>(
		defaultOptions,
		svelteConfig,
		inlineOptions,
		extraOptions
	);
	// configFile of svelteConfig contains the absolute path it was loaded from,
	// prefer it over the possibly relative inline path
	if (svelteConfig?.configFile) {
		merged.configFile = svelteConfig.configFile;
	}
	return merged;
}

function mergeConfigs<T>(...configs: (Partial<T> | undefined)[]): T {
	let result: Partial<T> = {};
	for (const config of configs.filter((x) => x != null)) {
		result = deepmerge<T>(result, config!, {
			// replace arrays
			arrayMerge: (target: any[], source: any[]) => source ?? target
		});
	}
	return result as T;
}

// used in configResolved phase, merges a contextual default config, pre-resolved options, and some preprocessors.
// also validates the final config.
export function resolveOptions(
	preResolveOptions: PreResolvedOptions,
	viteConfig: ResolvedConfig
): ResolvedOptions {
	const css = cssAsString
		? preResolveOptions.emitCss
			? 'external'
			: 'injected'
		: !preResolveOptions.emitCss;
	const defaultOptions: Partial<Options> = {
		hot: viteConfig.isProduction
			? false
			: {
					injectCss: css === true || css === 'injected',
					partialAccept: !!viteConfig.experimental?.hmrPartialAccept
			  },
		compilerOptions: {
			css,
			dev: !viteConfig.isProduction
		}
	};
	const extraOptions: Partial<ResolvedOptions> = {
		root: viteConfig.root,
		isProduction: viteConfig.isProduction
	};
	const merged = mergeConfigs<ResolvedOptions>(defaultOptions, preResolveOptions, extraOptions);

	removeIgnoredOptions(merged);
	handleDeprecatedOptions(merged);
	addSvelteKitOptions(merged);
	addExtraPreprocessors(merged, viteConfig);
	enforceOptionsForHmr(merged);
	enforceOptionsForProduction(merged);
	// mergeConfigs would mangle functions on the stats class, so do this afterwards
	const isLogLevelInfo = [undefined, 'info'].includes(viteConfig.logLevel);
	const disableCompileStats = merged.experimental?.disableCompileStats;
	const statsEnabled =
		disableCompileStats !== true && disableCompileStats !== (merged.isBuild ? 'build' : 'dev');
	if (statsEnabled && isLogLevelInfo) {
		merged.stats = new VitePluginSvelteStats();
	}
	return merged;
}

function enforceOptionsForHmr(options: ResolvedOptions) {
	if (options.hot) {
		if (!options.compilerOptions.dev) {
			log.warn('hmr is enabled but compilerOptions.dev is false, forcing it to true');
			options.compilerOptions.dev = true;
		}
		if (options.emitCss) {
			if (options.hot !== true && options.hot.injectCss) {
				log.warn('hmr and emitCss are enabled but hot.injectCss is true, forcing it to false');
				options.hot.injectCss = false;
			}
			const css = options.compilerOptions.css;
			if (css === true || css === 'injected') {
				const forcedCss = cssAsString ? 'external' : false;
				log.warn(
					`hmr and emitCss are enabled but compilerOptions.css is ${css}, forcing it to ${forcedCss}`
				);
				options.compilerOptions.css = forcedCss;
			}
		} else {
			if (options.hot === true || !options.hot.injectCss) {
				log.warn(
					'hmr with emitCss disabled requires option hot.injectCss to be enabled, forcing it to true'
				);
				if (options.hot === true) {
					options.hot = { injectCss: true };
				} else {
					options.hot.injectCss = true;
				}
			}
			const css = options.compilerOptions.css;
			if (!(css === true || css === 'injected')) {
				const forcedCss = cssAsString ? 'injected' : true;
				log.warn(
					`hmr with emitCss disabled requires compilerOptions.css to be enabled, forcing it to ${forcedCss}`
				);
				options.compilerOptions.css = forcedCss;
			}
		}
	}
}

function enforceOptionsForProduction(options: ResolvedOptions) {
	if (options.isProduction) {
		if (options.hot) {
			log.warn('options.hot is enabled but does not work on production build, forcing it to false');
			options.hot = false;
		}
		if (options.compilerOptions.dev) {
			log.warn(
				'you are building for production but compilerOptions.dev is true, forcing it to false'
			);
			options.compilerOptions.dev = false;
		}
	}
}

function removeIgnoredOptions(options: ResolvedOptions) {
	const ignoredCompilerOptions = ['generate', 'format', 'filename'];
	if (options.hot && options.emitCss) {
		ignoredCompilerOptions.push('cssHash');
	}
	const passedCompilerOptions = Object.keys(options.compilerOptions || {});
	const passedIgnored = passedCompilerOptions.filter((o) => ignoredCompilerOptions.includes(o));
	if (passedIgnored.length) {
		log.warn(
			`The following Svelte compilerOptions are controlled by vite-plugin-svelte and essential to its functionality. User-specified values are ignored. Please remove them from your configuration: ${passedIgnored.join(
				', '
			)}`
		);
		passedIgnored.forEach((ignored) => {
			// @ts-expect-error string access
			delete options.compilerOptions[ignored];
		});
	}
}

// some SvelteKit options need compilerOptions to work, so set them here.
function addSvelteKitOptions(options: ResolvedOptions) {
	// @ts-expect-error kit is not typed to avoid dependency on sveltekit
	if (options?.kit != null && options.compilerOptions.hydratable == null) {
		log.debug(`Setting compilerOptions.hydratable = true for SvelteKit`);
		options.compilerOptions.hydratable = true;
	}
}

function handleDeprecatedOptions(options: ResolvedOptions) {
	if ((options.experimental as any)?.prebundleSvelteLibraries) {
		options.prebundleSvelteLibraries = (options.experimental as any)?.prebundleSvelteLibraries;
		log.warn(
			'experimental.prebundleSvelteLibraries is no longer experimental and has moved to prebundleSvelteLibraries'
		);
	}
	if ((options.experimental as any)?.generateMissingPreprocessorSourcemaps) {
		log.warn('experimental.generateMissingPreprocessorSourcemaps has been removed.');
	}
}

// vite passes unresolved `root`option to config hook but we need the resolved value, so do it here
// https://github.com/sveltejs/vite-plugin-svelte/issues/113
// https://github.com/vitejs/vite/blob/43c957de8a99bb326afd732c962f42127b0a4d1e/packages/vite/src/node/config.ts#L293
function resolveViteRoot(viteConfig: UserConfig): string | undefined {
	return normalizePath(viteConfig.root ? path.resolve(viteConfig.root) : process.cwd());
}

export async function buildExtraViteConfig(
	options: PreResolvedOptions,
	config: UserConfig
): Promise<Partial<UserConfig>> {
	const extraViteConfig: Partial<UserConfig> = {
		resolve: {
			mainFields: [...SVELTE_RESOLVE_MAIN_FIELDS],
			dedupe: [...SVELTE_IMPORTS, ...SVELTE_HMR_IMPORTS],
			conditions: [...SVELTE_EXPORT_CONDITIONS]
		}
		// this option is still awaiting a PR in vite to be supported
		// see https://github.com/sveltejs/vite-plugin-svelte/issues/60
		// @ts-ignore
		// knownJsSrcExtensions: options.extensions
	};

	const extraSvelteConfig = buildExtraConfigForSvelte(config);
	const extraDepsConfig = await buildExtraConfigForDependencies(options, config);
	// merge extra svelte and deps config, but make sure dep values are not contradicting svelte
	extraViteConfig.optimizeDeps = {
		include: [
			...extraSvelteConfig.optimizeDeps.include,
			...extraDepsConfig.optimizeDeps.include.filter(
				(dep) => !isDepExcluded(dep, extraSvelteConfig.optimizeDeps.exclude)
			)
		],
		exclude: [
			...extraSvelteConfig.optimizeDeps.exclude,
			...extraDepsConfig.optimizeDeps.exclude.filter(
				(dep) => !isDepIncluded(dep, extraSvelteConfig.optimizeDeps.include)
			)
		]
	};

	extraViteConfig.ssr = {
		external: [
			...extraSvelteConfig.ssr.external,
			...extraDepsConfig.ssr.external.filter(
				(dep) => !isDepNoExternaled(dep, extraSvelteConfig.ssr.noExternal)
			)
		],
		noExternal: [
			...extraSvelteConfig.ssr.noExternal,
			...extraDepsConfig.ssr.noExternal.filter(
				(dep) => !isDepExternaled(dep, extraSvelteConfig.ssr.external)
			)
		]
	};

	// handle prebundling for svelte files
	if (options.prebundleSvelteLibraries) {
		extraViteConfig.optimizeDeps = {
			...extraViteConfig.optimizeDeps,
			// Experimental Vite API to allow these extensions to be scanned and prebundled
			// @ts-ignore
			extensions: options.extensions ?? ['.svelte'],
			// Add esbuild plugin to prebundle Svelte files.
			// Currently a placeholder as more information is needed after Vite config is resolved,
			// the real Svelte plugin is added in `patchResolvedViteConfig()`
			esbuildOptions: {
				plugins: [{ name: facadeEsbuildSveltePluginName, setup: () => {} }]
			}
		};
	}

	// enable hmrPartialAccept if not explicitly disabled
	if (
		(options.hot == null ||
			options.hot === true ||
			(options.hot && options.hot.partialAccept !== false)) && // deviate from svelte-hmr, default to true
		config.experimental?.hmrPartialAccept !== false
	) {
		log.debug('enabling "experimental.hmrPartialAccept" in vite config');
		extraViteConfig.experimental = { hmrPartialAccept: true };
	}
	validateViteConfig(extraViteConfig, config, options);
	return extraViteConfig;
}

function validateViteConfig(
	extraViteConfig: Partial<UserConfig>,
	config: UserConfig,
	options: PreResolvedOptions
) {
	const { prebundleSvelteLibraries, isBuild } = options;
	if (prebundleSvelteLibraries) {
		const isEnabled = (option: 'dev' | 'build' | boolean) =>
			option !== true && option !== (isBuild ? 'build' : 'dev');
		const logWarning = (name: string, value: 'dev' | 'build' | boolean, recommendation: string) =>
			log.warn.once(
				`Incompatible options: \`prebundleSvelteLibraries: true\` and vite \`${name}: ${JSON.stringify(
					value
				)}\` ${isBuild ? 'during build.' : '.'} ${recommendation}`
			);
		const viteOptimizeDepsDisabled = config.optimizeDeps?.disabled ?? 'build'; // fall back to vite default
		const isOptimizeDepsEnabled = isEnabled(viteOptimizeDepsDisabled);
		if (!isBuild && !isOptimizeDepsEnabled) {
			logWarning(
				'optimizeDeps.disabled',
				viteOptimizeDepsDisabled,
				'Forcing `optimizeDeps.disabled: "build"`. Disable prebundleSvelteLibraries or update your vite config to enable optimizeDeps during dev.'
			);
			extraViteConfig.optimizeDeps!.disabled = 'build';
		} else if (isBuild && isOptimizeDepsEnabled) {
			logWarning(
				'optimizeDeps.disabled',
				viteOptimizeDepsDisabled,
				'Disable optimizeDeps or prebundleSvelteLibraries for build if you experience errors.'
			);
		}
	}
}

async function buildExtraConfigForDependencies(options: PreResolvedOptions, config: UserConfig) {
	// extra handling for svelte dependencies in the project
	const depsConfig = await crawlFrameworkPkgs({
		root: options.root,
		isBuild: options.isBuild,
		viteUserConfig: config,
		isFrameworkPkgByJson(pkgJson) {
			let hasSvelteCondition = false;
			if (typeof pkgJson.exports === 'object') {
				// use replacer as a simple way to iterate over nested keys
				JSON.stringify(pkgJson.exports, (key, value) => {
					if (SVELTE_EXPORT_CONDITIONS.includes(key)) {
						hasSvelteCondition = true;
					}
					return value;
				});
			}
			return hasSvelteCondition || !!pkgJson.svelte;
		},
		isSemiFrameworkPkgByJson(pkgJson) {
			return !!pkgJson.dependencies?.svelte || !!pkgJson.peerDependencies?.svelte;
		},
		isFrameworkPkgByName(pkgName) {
			const isNotSveltePackage = isCommonDepWithoutSvelteField(pkgName);
			if (isNotSveltePackage) {
				return false;
			} else {
				return undefined;
			}
		}
	});

	log.debug('extra config for dependencies generated by vitefu', depsConfig);

	if (options.prebundleSvelteLibraries) {
		// prebundling enabled, so we don't need extra dependency excludes
		depsConfig.optimizeDeps.exclude = [];
		// but keep dependency reinclusions of explicit user excludes
		const userExclude = config.optimizeDeps?.exclude;
		depsConfig.optimizeDeps.include = !userExclude
			? []
			: depsConfig.optimizeDeps.include.filter((dep: string) => {
					// reincludes look like this: foo > bar > baz
					// in case foo or bar are excluded, we have to retain the reinclude even with prebundling
					return (
						dep.includes('>') &&
						dep
							.split('>')
							.slice(0, -1)
							.some((d) => isDepExcluded(d.trim(), userExclude))
					);
			  });
	}
	if (options.disableDependencyReinclusion === true) {
		depsConfig.optimizeDeps.include = depsConfig.optimizeDeps.include.filter(
			(dep) => !dep.includes('>')
		);
	} else if (Array.isArray(options.disableDependencyReinclusion)) {
		const disabledDeps = options.disableDependencyReinclusion;
		depsConfig.optimizeDeps.include = depsConfig.optimizeDeps.include.filter((dep) => {
			if (!dep.includes('>')) return true;
			const trimDep = dep.replace(/\s+/g, '');
			return disabledDeps.some((disabled) => trimDep.includes(`${disabled}>`));
		});
	}

	log.debug('post-processed extra config for dependencies', depsConfig);

	return depsConfig;
}

function buildExtraConfigForSvelte(config: UserConfig) {
	// include svelte imports for optimization unless explicitly excluded
	const include: string[] = [];
	const exclude: string[] = ['svelte-hmr'];
	if (!isDepExcluded('svelte', config.optimizeDeps?.exclude ?? [])) {
		const svelteImportsToInclude = SVELTE_IMPORTS.filter((x) => x !== 'svelte/ssr'); // not used on clientside
		log.debug(
			`adding bare svelte packages to optimizeDeps.include: ${svelteImportsToInclude.join(', ')} `
		);
		include.push(...svelteImportsToInclude);
	} else {
		log.debug('"svelte" is excluded in optimizeDeps.exclude, skipped adding it to include.');
	}
	const noExternal: (string | RegExp)[] = [];
	const external: string[] = [];
	// add svelte to ssr.noExternal unless it is present in ssr.external
	// so we can resolve it with svelte/ssr
	if (!isDepExternaled('svelte', config.ssr?.external ?? [])) {
		noExternal.push('svelte', /^svelte\//);
	}
	return { optimizeDeps: { include, exclude }, ssr: { noExternal, external } };
}

export function patchResolvedViteConfig(viteConfig: ResolvedConfig, options: ResolvedOptions) {
	if (options.preprocess) {
		for (const preprocessor of arraify(options.preprocess)) {
			if (preprocessor.style && '__resolvedConfig' in preprocessor.style) {
				preprocessor.style.__resolvedConfig = viteConfig;
			}
		}
	}

	// replace facade esbuild plugin with a real one
	const facadeEsbuildSveltePlugin = viteConfig.optimizeDeps.esbuildOptions?.plugins?.find(
		(plugin) => plugin.name === facadeEsbuildSveltePluginName
	);
	if (facadeEsbuildSveltePlugin) {
		Object.assign(facadeEsbuildSveltePlugin, esbuildSveltePlugin(options));
	}
}

function arraify<T>(value: T | T[]): T[] {
	return Array.isArray(value) ? value : [value];
}

export type Options = Omit<SvelteOptions, 'vitePlugin'> & PluginOptionsInline;

interface PluginOptionsInline extends PluginOptions {
	/**
	 * Path to a svelte config file, either absolute or relative to Vite root
	 *
	 * set to `false` to ignore the svelte config file
	 *
	 * @see https://vitejs.dev/config/#root
	 */
	configFile?: string | false;
}

export interface PluginOptions {
	/**
	 * A `picomatch` pattern, or array of patterns, which specifies the files the plugin should
	 * operate on. By default, all svelte files are included.
	 *
	 * @see https://github.com/micromatch/picomatch
	 */
	include?: Arrayable<string>;

	/**
	 * A `picomatch` pattern, or array of patterns, which specifies the files to be ignored by the
	 * plugin. By default, no files are ignored.
	 *
	 * @see https://github.com/micromatch/picomatch
	 */
	exclude?: Arrayable<string>;

	/**
	 * Emit Svelte styles as virtual CSS files for Vite and other plugins to process
	 *
	 * @default true
	 */
	emitCss?: boolean;

	/**
	 * Enable or disable Hot Module Replacement.
	 *
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 *
	 * DO NOT CUSTOMIZE SVELTE-HMR OPTIONS UNLESS YOU KNOW EXACTLY WHAT YOU ARE DOING
	 *
	 *                             YOU HAVE BEEN WARNED
	 *
	 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	 *
	 * Set an object to pass custom options to svelte-hmr
	 *
	 * @see https://github.com/rixo/svelte-hmr#options
	 * @default true for development, always false for production
	 */
	hot?: boolean | { injectCss?: boolean; partialAccept?: boolean; [key: string]: any };

	/**
	 * Some Vite plugins can contribute additional preprocessors by defining `api.sveltePreprocess`.
	 * If you don't want to use them, set this to true to ignore them all or use an array of strings
	 * with plugin names to specify which.
	 *
	 * @default false
	 */
	ignorePluginPreprocessors?: boolean | string[];

	/**
	 * vite-plugin-svelte automatically handles excluding svelte libraries and reinclusion of their dependencies
	 * in vite.optimizeDeps.
	 *
	 * `disableDependencyReinclusion: true` disables all reinclusions
	 * `disableDependencyReinclusion: ['foo','bar']` disables reinclusions for dependencies of foo and bar
	 *
	 * This should be used for hybrid packages that contain both node and browser dependencies, eg Routify
	 *
	 * @default false
	 */
	disableDependencyReinclusion?: boolean | string[];

	/**
	 * Enable support for Vite's dependency optimization to prebundle Svelte libraries.
	 *
	 * To disable prebundling for a specific library, add it to `optimizeDeps.exclude`.
	 *
	 * @default true for dev, false for build
	 */
	prebundleSvelteLibraries?: boolean;

	/**
	 * These options are considered experimental and breaking changes to them can occur in any release
	 */
	experimental?: ExperimentalOptions;
}

export interface SvelteOptions {
	/**
	 * A list of file extensions to be compiled by Svelte
	 *
	 * @default ['.svelte']
	 */
	extensions?: string[];

	/**
	 * An array of preprocessors to transform the Svelte source code before compilation
	 *
	 * @see https://svelte.dev/docs#svelte_preprocess
	 */
	preprocess?: Arrayable<PreprocessorGroup>;

	/**
	 * The options to be passed to the Svelte compiler. A few options are set by default,
	 * including `dev` and `css`. However, some options are non-configurable, like
	 * `filename`, `format`, `generate`, and `cssHash` (in dev).
	 *
	 * @see https://svelte.dev/docs#svelte_compile
	 */
	compilerOptions?: Omit<CompileOptions, 'filename' | 'format' | 'generate'>;

	/**
	 * Handles warning emitted from the Svelte compiler
	 */
	onwarn?: (warning: Warning, defaultHandler?: (warning: Warning) => void) => void;

	/**
	 * Options for vite-plugin-svelte
	 */
	vitePlugin?: PluginOptions;
}

/**
 * These options are considered experimental and breaking changes to them can occur in any release
 */
export interface ExperimentalOptions {
	/**
	 * Use extra preprocessors that delegate style and TypeScript preprocessing to native Vite plugins
	 *
	 * Do not use together with `svelte-preprocess`!
	 *
	 * @default false
	 */
	useVitePreprocess?: boolean;

	/**
	 * A function to update `compilerOptions` before compilation
	 *
	 * `data.filename` - The file to be compiled
	 * `data.code` - The preprocessed Svelte code
	 * `data.compileOptions` - The current compiler options
	 *
	 * To change part of the compiler options, return an object with the changes you need.
	 *
	 * @example
	 * ```
	 * ({ filename, compileOptions }) => {
	 *   // Dynamically set hydration per Svelte file
	 *   if (compileWithHydratable(filename) && !compileOptions.hydratable) {
	 *     return { hydratable: true };
	 *   }
	 * }
	 * ```
	 */
	dynamicCompileOptions?: (data: {
		filename: string;
		code: string;
		compileOptions: Partial<CompileOptions>;
	}) => Promise<Partial<CompileOptions> | void> | Partial<CompileOptions> | void;

	/**
	 * enable svelte inspector
	 */
	inspector?: InspectorOptions | boolean;

	/**
	 * send a websocket message with svelte compiler warnings during dev
	 *
	 */
	sendWarningsToBrowser?: boolean;

	/**
	 * disable svelte compile statistics
	 *
	 * @default false
	 */
	disableCompileStats?: 'dev' | 'build' | boolean;
}

export interface InspectorOptions {
	/**
	 * define a key combo to toggle inspector,
	 * @default 'control-shift' on windows, 'meta-shift' on other os
	 *
	 * any number of modifiers `control` `shift` `alt` `meta` followed by zero or one regular key, separated by -
	 * examples: control-shift, control-o, control-alt-s  meta-x control-meta
	 * Some keys have native behavior (e.g. alt-s opens history menu on firefox).
	 * To avoid conflicts or accidentally typing into inputs, modifier only combinations are recommended.
	 */
	toggleKeyCombo?: string;

	/**
	 * define keys to select elements with via keyboard
	 * @default {parent: 'ArrowUp', child: 'ArrowDown', next: 'ArrowRight', prev: 'ArrowLeft' }
	 *
	 * improves accessibility and also helps when you want to select elements that do not have a hoverable surface area
	 * due to tight wrapping
	 *
	 * A note for users of screen-readers:
	 * If you are using arrow keys to navigate the page itself, change the navKeys to avoid conflicts.
	 * e.g. navKeys: {parent: 'w', prev: 'a', child: 's', next: 'd'}
	 *
	 *
	 * parent: select closest parent
	 * child: select first child (or grandchild)
	 * next: next sibling (or parent if no next sibling exists)
	 * prev: previous sibling (or parent if no prev sibling exists)
	 */
	navKeys?: { parent: string; child: string; next: string; prev: string };

	/**
	 * define key to open the editor for the currently selected dom node
	 *
	 * @default 'Enter'
	 */
	openKey?: string;

	/**
	 * inspector is automatically disabled when releasing toggleKeyCombo after holding it for a longpress
	 * @default false
	 */
	holdMode?: boolean;
	/**
	 * when to show the toggle button
	 * @default 'active'
	 */
	showToggleButton?: 'always' | 'active' | 'never';

	/**
	 * where to display the toggle button
	 * @default top-right
	 */
	toggleButtonPos?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

	/**
	 * inject custom styles when inspector is active
	 */
	customStyles?: boolean;

	/**
	 * append an import to the module id ending with `appendTo` instead of adding a script into body
	 * useful for frameworks that do not support trannsformIndexHtml hook
	 *
	 * WARNING: only set this if you know exactly what it does.
	 * Regular users of vite-plugin-svelte or SvelteKit do not need it
	 */
	appendTo?: string;
}

export interface PreResolvedOptions extends Options {
	// these options are non-nullable after resolve
	compilerOptions: CompileOptions;
	experimental?: ExperimentalOptions;
	// extra options
	root: string;
	isBuild: boolean;
	isServe: boolean;
	isDebug: boolean;
}

export interface ResolvedOptions extends PreResolvedOptions {
	isProduction: boolean;
	server?: ViteDevServer;
	stats?: VitePluginSvelteStats;
}

export type {
	CompileOptions,
	Processed,
	MarkupPreprocessor,
	Preprocessor,
	PreprocessorGroup,
	Warning
};

export type ModuleFormat = NonNullable<CompileOptions['format']>;

export type CssHashGetter = NonNullable<CompileOptions['cssHash']>;

export type Arrayable<T> = T | T[];
