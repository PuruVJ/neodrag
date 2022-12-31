import fs from 'fs';
import { HmrContext, ModuleNode, Plugin, ResolvedConfig, UserConfig } from 'vite';
// eslint-disable-next-line node/no-missing-import
import { isDepExcluded } from 'vitefu';
import { handleHotUpdate } from './handle-hot-update';
import { log, logCompilerWarnings } from './utils/log';
import { type CompileSvelte, createCompileSvelte } from './utils/compile';
import { buildIdParser, IdParser } from './utils/id';
import {
	buildExtraViteConfig,
	validateInlineOptions,
	Options,
	ResolvedOptions,
	resolveOptions,
	patchResolvedViteConfig,
	preResolveOptions
} from './utils/options';

import { ensureWatchedFile, setupWatchers } from './utils/watch';
import { resolveViaPackageJsonSvelte } from './utils/resolve';
import { PartialResolvedId } from 'rollup';
import { toRollupError } from './utils/error';
import { saveSvelteMetadata } from './utils/optimizer';
import { svelteInspector } from './ui/inspector/plugin';
import { VitePluginSvelteCache } from './utils/vite-plugin-svelte-cache';
import { loadRaw } from './utils/load-raw';

interface PluginAPI {
	/**
	 * must not be modified, should not be used outside of vite-plugin-svelte repo
	 * @internal
	 * @experimental
	 */
	options?: ResolvedOptions;
	// TODO expose compile cache here so other utility plugins can use it
}

export function svelte(inlineOptions?: Partial<Options>): Plugin[] {
	if (process.env.DEBUG != null) {
		log.setLevel('debug');
	}
	validateInlineOptions(inlineOptions);
	const cache = new VitePluginSvelteCache();
	// updated in configResolved hook
	let requestParser: IdParser;
	let options: ResolvedOptions;
	let viteConfig: ResolvedConfig;
	/* eslint-disable no-unused-vars */
	let compileSvelte: CompileSvelte;
	/* eslint-enable no-unused-vars */

	let resolvedSvelteSSR: Promise<PartialResolvedId | null>;
	const api: PluginAPI = {};
	const plugins: Plugin[] = [
		{
			name: 'vite-plugin-svelte',
			// make sure our resolver runs before vite internal resolver to resolve svelte field correctly
			enforce: 'pre',
			api,
			async config(config, configEnv): Promise<Partial<UserConfig>> {
				// setup logger
				if (process.env.DEBUG) {
					log.setLevel('debug');
				} else if (config.logLevel) {
					log.setLevel(config.logLevel);
				}
				// @ts-expect-error temporarily lend the options variable until fixed in configResolved
				options = await preResolveOptions(inlineOptions, config, configEnv);
				// extra vite config
				const extraViteConfig = await buildExtraViteConfig(options, config);
				log.debug('additional vite config', extraViteConfig);
				return extraViteConfig;
			},

			async configResolved(config) {
				options = resolveOptions(options, config);
				patchResolvedViteConfig(config, options);
				requestParser = buildIdParser(options);
				compileSvelte = createCompileSvelte(options);
				viteConfig = config;
				// TODO deep clone to avoid mutability from outside?
				api.options = options;
				log.debug('resolved options', options);
			},

			async buildStart() {
				if (!options.prebundleSvelteLibraries) return;
				const isSvelteMetadataChanged = await saveSvelteMetadata(viteConfig.cacheDir, options);
				if (isSvelteMetadataChanged) {
					// Force Vite to optimize again. Although we mutate the config here, it works because
					// Vite's optimizer runs after `buildStart()`.
					viteConfig.optimizeDeps.force = true;
				}
			},

			configureServer(server) {
				// eslint-disable-next-line no-unused-vars
				options.server = server;
				setupWatchers(options, cache, requestParser);
			},

			async load(id, opts) {
				const ssr = !!opts?.ssr;
				const svelteRequest = requestParser(id, !!ssr);
				if (svelteRequest) {
					const { filename, query, raw } = svelteRequest;
					if (raw) {
						return loadRaw(svelteRequest, compileSvelte, options);
					} else {
						if (query.svelte && query.type === 'style') {
							const css = cache.getCSS(svelteRequest);
							if (css) {
								log.debug(`load returns css for ${filename}`);
								return css;
							}
						}
						// prevent vite asset plugin from loading files as url that should be compiled in transform
						if (viteConfig.assetsInclude(filename)) {
							log.debug(`load returns raw content for ${filename}`);
							return fs.readFileSync(filename, 'utf-8');
						}
					}
				}
			},

			async resolveId(importee, importer, opts) {
				const ssr = !!opts?.ssr;
				const svelteRequest = requestParser(importee, ssr);
				if (svelteRequest?.query.svelte) {
					if (svelteRequest.query.type === 'style' && !svelteRequest.raw) {
						// return cssId with root prefix so postcss pipeline of vite finds the directory correctly
						// see https://github.com/sveltejs/vite-plugin-svelte/issues/14
						log.debug(`resolveId resolved virtual css module ${svelteRequest.cssId}`);
						return svelteRequest.cssId;
					}
				}

				if (ssr && importee === 'svelte') {
					if (!resolvedSvelteSSR) {
						resolvedSvelteSSR = this.resolve('svelte/ssr', undefined, { skipSelf: true }).then(
							(svelteSSR) => {
								log.debug('resolved svelte to svelte/ssr');
								return svelteSSR;
							},
							(err) => {
								log.debug(
									'failed to resolve svelte to svelte/ssr. Update svelte to a version that exports it',
									err
								);
								return null; // returning null here leads to svelte getting resolved regularly
							}
						);
					}
					return resolvedSvelteSSR;
				}
				//@ts-expect-error scan
				const scan = !!opts?.scan; // scanner phase of optimizeDeps
				const isPrebundled =
					options.prebundleSvelteLibraries &&
					viteConfig.optimizeDeps?.disabled !== true &&
					viteConfig.optimizeDeps?.disabled !== (options.isBuild ? 'build' : 'dev') &&
					!isDepExcluded(importee, viteConfig.optimizeDeps?.exclude ?? []);
				// for prebundled libraries we let vite resolve the prebundling result
				// for ssr, during scanning and non-prebundled, we do it
				if (ssr || scan || !isPrebundled) {
					try {
						const resolved = await resolveViaPackageJsonSvelte(importee, importer, cache);
						if (resolved) {
							log.debug(
								`resolveId resolved ${resolved} via package.json svelte field of ${importee}`
							);
							return resolved;
						}
					} catch (e) {
						log.debug.once(
							`error trying to resolve ${importee} from ${importer} via package.json svelte field `,
							e
						);
						// this error most likely happens due to non-svelte related importee/importers so swallow it here
						// in case it really way a svelte library, users will notice anyway. (lib not working due to failed resolve)
					}
				}
			},

			async transform(code, id, opts) {
				const ssr = !!opts?.ssr;
				const svelteRequest = requestParser(id, ssr);
				if (!svelteRequest || svelteRequest.query.type === 'style' || svelteRequest.raw) {
					return;
				}
				let compileData;
				try {
					compileData = await compileSvelte(svelteRequest, code, options);
				} catch (e) {
					cache.setError(svelteRequest, e);
					throw toRollupError(e, options);
				}
				logCompilerWarnings(svelteRequest, compileData.compiled.warnings, options);
				cache.update(compileData);
				if (compileData.dependencies?.length && options.server) {
					compileData.dependencies.forEach((d) => {
						ensureWatchedFile(options.server!.watcher, d, options.root);
					});
				}
				log.debug(`transform returns compiled js for ${svelteRequest.filename}`);
				return {
					...compileData.compiled.js,
					meta: {
						vite: {
							lang: compileData.lang
						}
					}
				};
			},

			handleHotUpdate(ctx: HmrContext): void | Promise<Array<ModuleNode> | void> {
				if (!options.hot || !options.emitCss) {
					return;
				}
				const svelteRequest = requestParser(ctx.file, false, ctx.timestamp);
				if (svelteRequest) {
					try {
						return handleHotUpdate(compileSvelte, ctx, svelteRequest, cache, options);
					} catch (e) {
						throw toRollupError(e, options);
					}
				}
			},
			async buildEnd() {
				await options.stats?.finishAll();
			}
		}
	];
	plugins.push(svelteInspector());
	return plugins.filter(Boolean);
}

export { vitePreprocess } from './preprocess';
export { loadSvelteConfig } from './utils/load-svelte-config';

export {
	Options,
	PluginOptions,
	SvelteOptions,
	Preprocessor,
	PreprocessorGroup,
	CompileOptions,
	CssHashGetter,
	Arrayable,
	MarkupPreprocessor,
	ModuleFormat,
	Processed,
	Warning
} from './utils/options';

export { SvelteWarningsMessage } from './utils/log';
