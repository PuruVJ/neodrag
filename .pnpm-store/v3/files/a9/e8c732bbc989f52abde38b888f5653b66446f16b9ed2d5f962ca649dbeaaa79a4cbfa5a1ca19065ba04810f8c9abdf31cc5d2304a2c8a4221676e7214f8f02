import type { ResolvedConfig, Plugin } from 'vite';
import MagicString from 'magic-string';
import { preprocess } from 'svelte/compiler';
import { PreprocessorGroup, ResolvedOptions } from './options';
import { log } from './log';
import path from 'path';
import { vitePreprocess } from '../preprocess';

function createVitePreprocessorGroup(config: ResolvedConfig): PreprocessorGroup {
	return {
		markup({ content, filename }) {
			return preprocess(content, vitePreprocess({ style: config }), { filename });
		}
	};
}

/**
 * this appends a *{} rule to component styles to force the svelte compiler to add style classes to all nodes
 * That means adding/removing class rules from <style> node won't trigger js updates as the scope classes are not changed
 *
 * only used during dev with enabled css hmr
 */
export function createInjectScopeEverythingRulePreprocessorGroup(): PreprocessorGroup {
	return {
		style({ content, filename }) {
			const s = new MagicString(content);
			s.append(' *{}');
			return {
				code: s.toString(),
				map: s.generateDecodedMap({
					source: filename ? path.basename(filename) : undefined,
					hires: true
				})
			};
		}
	};
}

function buildExtraPreprocessors(options: ResolvedOptions, config: ResolvedConfig) {
	const prependPreprocessors: PreprocessorGroup[] = [];
	const appendPreprocessors: PreprocessorGroup[] = [];

	if (options.experimental?.useVitePreprocess) {
		log.warn(
			'`experimental.useVitePreprocess` is deprecated. Use the `vitePreprocess()` preprocessor instead. See https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/preprocess.md for more information.'
		);
		prependPreprocessors.push(createVitePreprocessorGroup(config));
	}

	// @ts-ignore
	const pluginsWithPreprocessorsDeprecated = config.plugins.filter((p) => p?.sveltePreprocess);
	if (pluginsWithPreprocessorsDeprecated.length > 0) {
		log.warn(
			`The following plugins use the deprecated 'plugin.sveltePreprocess' field. Please contact their maintainers and ask them to move it to 'plugin.api.sveltePreprocess': ${pluginsWithPreprocessorsDeprecated
				.map((p) => p.name)
				.join(', ')}`
		);
		// patch plugin to avoid breaking
		pluginsWithPreprocessorsDeprecated.forEach((p) => {
			if (!p.api) {
				p.api = {};
			}
			if (p.api.sveltePreprocess === undefined) {
				// @ts-ignore
				p.api.sveltePreprocess = p.sveltePreprocess;
			} else {
				log.error(
					`ignoring plugin.sveltePreprocess of ${p.name} because it already defined plugin.api.sveltePreprocess.`
				);
			}
		});
	}

	const pluginsWithPreprocessors: Plugin[] = config.plugins.filter((p) => p?.api?.sveltePreprocess);
	const ignored: Plugin[] = [],
		included: Plugin[] = [];
	for (const p of pluginsWithPreprocessors) {
		if (
			options.ignorePluginPreprocessors === true ||
			(Array.isArray(options.ignorePluginPreprocessors) &&
				options.ignorePluginPreprocessors?.includes(p.name))
		) {
			ignored.push(p);
		} else {
			included.push(p);
		}
	}
	if (ignored.length > 0) {
		log.debug(
			`Ignoring svelte preprocessors defined by these vite plugins: ${ignored
				.map((p) => p.name)
				.join(', ')}`
		);
	}
	if (included.length > 0) {
		log.debug(
			`Adding svelte preprocessors defined by these vite plugins: ${included
				.map((p) => p.name)
				.join(', ')}`
		);
		appendPreprocessors.push(...pluginsWithPreprocessors.map((p) => p.api.sveltePreprocess));
	}

	return { prependPreprocessors, appendPreprocessors };
}

export function addExtraPreprocessors(options: ResolvedOptions, config: ResolvedConfig) {
	const { prependPreprocessors, appendPreprocessors } = buildExtraPreprocessors(options, config);
	if (prependPreprocessors.length > 0 || appendPreprocessors.length > 0) {
		if (!options.preprocess) {
			options.preprocess = [...prependPreprocessors, ...appendPreprocessors];
		} else if (Array.isArray(options.preprocess)) {
			options.preprocess.unshift(...prependPreprocessors);
			options.preprocess.push(...appendPreprocessors);
		} else {
			options.preprocess = [...prependPreprocessors, options.preprocess, ...appendPreprocessors];
		}
	}
}
