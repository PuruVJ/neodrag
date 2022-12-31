import { InlineConfig, ResolvedConfig, UserConfig, Plugin } from 'vite';
import { CompileOptions, Warning } from 'svelte/types/compiler/interfaces';
export { CompileOptions, Warning } from 'svelte/types/compiler/interfaces';
import { PreprocessorGroup } from 'svelte/types/compiler/preprocess';
export { MarkupPreprocessor, Preprocessor, PreprocessorGroup, Processed } from 'svelte/types/compiler/preprocess';

type Options = Omit<SvelteOptions, 'vitePlugin'> & PluginOptionsInline;
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
interface PluginOptions {
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
    hot?: boolean | {
        injectCss?: boolean;
        partialAccept?: boolean;
        [key: string]: any;
    };
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
interface SvelteOptions {
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
interface ExperimentalOptions {
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
interface InspectorOptions {
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
    navKeys?: {
        parent: string;
        child: string;
        next: string;
        prev: string;
    };
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
type ModuleFormat = NonNullable<CompileOptions['format']>;
type CssHashGetter = NonNullable<CompileOptions['cssHash']>;
type Arrayable<T> = T | T[];

declare function vitePreprocess(opts?: {
    script?: boolean;
    style?: boolean | InlineConfig | ResolvedConfig;
}): PreprocessorGroup;

declare function loadSvelteConfig(viteConfig?: UserConfig, inlineOptions?: Partial<Options>): Promise<Partial<SvelteOptions> | undefined>;

type SvelteWarningsMessage = {
    id: string;
    filename: string;
    normalizedFilename: string;
    timestamp: number;
    warnings: Warning[];
    allWarnings: Warning[];
    rawWarnings: Warning[];
};

declare function svelte(inlineOptions?: Partial<Options>): Plugin[];

export { Arrayable, CssHashGetter, ModuleFormat, Options, PluginOptions, SvelteOptions, SvelteWarningsMessage, loadSvelteConfig, svelte, vitePreprocess };
