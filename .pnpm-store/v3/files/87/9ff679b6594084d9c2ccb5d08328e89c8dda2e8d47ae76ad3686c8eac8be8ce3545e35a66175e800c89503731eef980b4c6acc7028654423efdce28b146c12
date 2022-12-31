import MagicString from 'magic-string';

declare const builtinPresets: {
    '@vue/composition-api': InlinePreset;
    '@vueuse/core': () => Preset;
    '@vueuse/head': InlinePreset;
    pinia: InlinePreset;
    preact: InlinePreset;
    quasar: InlinePreset;
    react: InlinePreset;
    'react-router': InlinePreset;
    'react-router-dom': InlinePreset;
    svelte: InlinePreset;
    'svelte/animate': InlinePreset;
    'svelte/easing': InlinePreset;
    'svelte/motion': InlinePreset;
    'svelte/store': InlinePreset;
    'svelte/transition': InlinePreset;
    'vee-validate': InlinePreset;
    vitepress: InlinePreset;
    'vue-demi': InlinePreset;
    'vue-i18n': InlinePreset;
    'vue-router': InlinePreset;
    vue: InlinePreset;
    'vue/macros': InlinePreset;
    vuex: InlinePreset;
    vitest: InlinePreset;
    'uni-app': InlinePreset;
    'solid-js': InlinePreset;
    'solid-app-router': InlinePreset;
};
type BuiltinPresetName = keyof typeof builtinPresets;

type ModuleId = string;
type ImportName = string;
interface ImportCommon {
    /** Module specifier to import from */
    from: ModuleId;
    /**
     * Priority of the import, if multiple imports have the same name, the one with the highest priority will be used
     * @default 1
     */
    priority?: number;
    /** If this import is disabled */
    disabled?: boolean;
}
interface Import extends ImportCommon {
    /** Import name to be detected */
    name: ImportName;
    /** Import as this name */
    as?: ImportName;
}
type PresetImport = ImportName | [name: ImportName, as?: ImportName, from?: ModuleId] | Exclude<Import, 'from'>;
interface InlinePreset extends ImportCommon {
    imports: (PresetImport | InlinePreset)[];
}
/**
 * Auto extract exports from a package for auto import
 */
interface PackagePreset {
    /**
     * Name of the package
     */
    package: string;
    /**
     * Path of the importer
     * @default process.cwd()
     */
    url?: string;
    /**
     * RegExp, string, or custom function to exclude names of the extracted imports
     */
    ignore?: (string | RegExp | ((name: string) => boolean))[];
    /**
     * Use local cache if exits
     * @default true
     */
    cache?: boolean;
}
type Preset = InlinePreset | PackagePreset;
interface UnimportContext {
    staticImports: Import[];
    dynamicImports: Import[];
    getImports(): Promise<Import[]>;
    getImportMap(): Promise<Map<string, Import>>;
    addons: Addon[];
    invalidate(): void;
    resolveId(id: string, parentId?: string): Thenable<string | null | undefined | void>;
    options: Partial<UnimportOptions>;
}
interface AddonsOptions {
    /**
     * Enable auto import inside for Vue's <template>
     *
     * @default false
     */
    vueTemplate?: boolean;
}
interface UnimportOptions {
    imports: Import[];
    presets: (Preset | BuiltinPresetName)[];
    warn: (msg: string) => void;
    addons: AddonsOptions | Addon[];
    virtualImports: string[];
    /**
     * Custom resolver to auto import id
     */
    resolveId?: (id: string, importee?: string) => Thenable<string | void>;
}
type PathFromResolver = (_import: Import) => string | undefined;
interface ScanDirExportsOptions {
    /**
     * Glob patterns for matching files
     *
     * @default ['*.{ts,js,mjs,cjs,mts,cts}']
     */
    filePatterns?: string[];
    /**
     * Custom function to filter scanned files
     */
    fileFilter?: (file: string) => boolean;
    /**
     * Current working directory
     *
     * @default process.cwd()
     */
    cwd?: string;
}
interface TypeDeclarationOptions {
    /**
     * Custom resolver for path of the import
     */
    resolvePath?: PathFromResolver;
    /**
     * Append `export {}` to the end of the file
     *
     * @default true
     */
    exportHelper?: boolean;
}
interface InjectImportsOptions {
    /**
     * @default false
     */
    mergeExisting?: boolean;
    /**
     * If the module should be auto imported
     *
     * @default true
     */
    autoImport?: boolean;
    /**
     * If the module should be transformed for virtual modules.
     * Only available when `virtualImports` is set.
     *
     * @default true
     */
    transformVirtualImports?: boolean;
    /** @deprecated */
    transformVirtualImoports?: boolean;
}
type Thenable<T> = Promise<T> | T;
interface Addon {
    transform?: (this: UnimportContext, code: MagicString, id: string | undefined) => Thenable<MagicString>;
    declaration?: (this: UnimportContext, dts: string, options: TypeDeclarationOptions) => Thenable<string>;
    matchImports?: (this: UnimportContext, identifiers: Set<string>, matched: Import[]) => Thenable<Import[] | void>;
}
interface InstallGlobalOptions {
    /**
     * @default globalThis
     */
    globalObject?: any;
    /**
     * Overrides the existing property
     * @default false
     */
    overrides?: boolean;
}

export { AddonsOptions as A, BuiltinPresetName as B, Import as I, ModuleId as M, Preset as P, ScanDirExportsOptions as S, TypeDeclarationOptions as T, UnimportOptions as U, InlinePreset as a, Thenable as b, InjectImportsOptions as c, InstallGlobalOptions as d, builtinPresets as e, ImportName as f, ImportCommon as g, PresetImport as h, PackagePreset as i, UnimportContext as j, PathFromResolver as k, Addon as l };
