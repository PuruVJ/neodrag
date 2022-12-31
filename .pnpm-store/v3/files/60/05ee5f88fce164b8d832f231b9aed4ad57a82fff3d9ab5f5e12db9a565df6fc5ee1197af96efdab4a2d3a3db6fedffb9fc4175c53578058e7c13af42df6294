type HMRPayload =
  | ConnectedPayload
  | UpdatePayload
  | FullReloadPayload
  | CustomPayload
  | ErrorPayload
  | PrunePayload

interface ConnectedPayload {
  type: 'connected'
}

interface UpdatePayload {
  type: 'update'
  updates: Update[]
}

interface Update {
  type: 'js-update' | 'css-update'
  path: string
  acceptedPath: string
  timestamp: number
  /**
   * @experimental internal
   */
  explicitImportRequired?: boolean | undefined
}

interface PrunePayload {
  type: 'prune'
  paths: string[]
}

interface FullReloadPayload {
  type: 'full-reload'
  path?: string
}

interface CustomPayload {
  type: 'custom'
  event: string
  data?: any
}

interface ErrorPayload {
  type: 'error'
  err: {
    [name: string]: any
    message: string
    stack: string
    id?: string
    frame?: string
    plugin?: string
    pluginCode?: string
    loc?: {
      file?: string
      line: number
      column: number
    }
  }
}

interface CustomEventMap {
  'vite:beforeUpdate': UpdatePayload
  'vite:afterUpdate': UpdatePayload
  'vite:beforePrune': PrunePayload
  'vite:beforeFullReload': FullReloadPayload
  'vite:error': ErrorPayload
  'vite:invalidate': InvalidatePayload
}

interface InvalidatePayload {
  path: string
  message: string | undefined
}

type InferCustomEventPayload<T extends string> =
  T extends keyof CustomEventMap ? CustomEventMap[T] : any

type ModuleNamespace = Record<string, any> & {
  [Symbol.toStringTag]: 'Module'
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  acceptExports(
    exportNames: string | readonly string[],
    cb?: (mod: ModuleNamespace | undefined) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}

declare const DEFAULT_REQUEST_STUBS: {
    '/@vite/client': {
        injectQuery: (id: string) => string;
        createHotContext(): {
            accept: () => void;
            prune: () => void;
            dispose: () => void;
            decline: () => void;
            invalidate: () => void;
            on: () => void;
        };
        updateStyle(id: string, css: string): void;
    };
    '@vite/client': {
        injectQuery: (id: string) => string;
        createHotContext(): {
            accept: () => void;
            prune: () => void;
            dispose: () => void;
            decline: () => void;
            invalidate: () => void;
            on: () => void;
        };
        updateStyle(id: string, css: string): void;
    };
};
declare class ModuleCacheMap extends Map<string, ModuleCache> {
    normalizePath(fsPath: string): string;
    /**
     * Assign partial data to the map
     */
    update(fsPath: string, mod: Partial<ModuleCache>): this;
    set(fsPath: string, mod: ModuleCache): this;
    get(fsPath: string): ModuleCache;
    delete(fsPath: string): boolean;
    /**
     * Invalidate modules that dependent on the given modules, up to the main entry
     */
    invalidateDepTree(ids: string[] | Set<string>, invalidated?: Set<string>): Set<string>;
    /**
     * Invalidate dependency modules of the given modules, down to the bottom-level dependencies
     */
    invalidateSubDepTree(ids: string[] | Set<string>, invalidated?: Set<string>): Set<string>;
    /**
     * Return parsed source map based on inlined source map of the module
     */
    getSourceMap(id: string): RawSourceMap | null;
}
declare class ViteNodeRunner {
    options: ViteNodeRunnerOptions;
    root: string;
    debug: boolean;
    /**
     * Holds the cache of modules
     * Keys of the map are filepaths, or plain package names
     */
    moduleCache: ModuleCacheMap;
    constructor(options: ViteNodeRunnerOptions);
    executeFile(file: string): Promise<any>;
    executeId(rawId: string): Promise<any>;
    getSourceMap(id: string): RawSourceMap | null;
    /** @internal */
    cachedRequest(id: string, fsPath: string, callstack: string[]): Promise<any>;
    shouldResolveId(id: string, _importee?: string): boolean;
    resolveUrl(id: string, importee?: string): Promise<[url: string, fsPath: string]>;
    /** @internal */
    dependencyRequest(id: string, fsPath: string, callstack: string[]): Promise<any>;
    /** @internal */
    directRequest(id: string, fsPath: string, _callstack: string[]): Promise<any>;
    prepareContext(context: Record<string, any>): Record<string, any>;
    /**
     * Define if a module should be interop-ed
     * This function mostly for the ability to override by subclass
     */
    shouldInterop(path: string, mod: any): boolean;
    /**
     * Import a module and interop it
     */
    interopedImport(path: string): Promise<any>;
}

type Nullable<T> = T | null | undefined;
type Arrayable<T> = T | Array<T>;
interface DepsHandlingOptions {
    external?: (string | RegExp)[];
    inline?: (string | RegExp)[] | true;
    /**
     * Try to guess the CJS version of a package when it's invalid ESM
     * @default false
     */
    fallbackCJS?: boolean;
}
interface StartOfSourceMap {
    file?: string;
    sourceRoot?: string;
}
interface RawSourceMap extends StartOfSourceMap {
    version: string;
    sources: string[];
    names: string[];
    sourcesContent?: string[];
    mappings: string;
}
interface FetchResult {
    code?: string;
    externalize?: string;
    map?: RawSourceMap;
}
type HotContext = Omit<ViteHotContext, 'acceptDeps' | 'decline'>;
type FetchFunction = (id: string) => Promise<FetchResult>;
type ResolveIdFunction = (id: string, importer?: string) => Promise<ViteNodeResolveId | null>;
type CreateHotContextFunction = (runner: ViteNodeRunner, url: string) => HotContext;
interface ModuleCache {
    promise?: Promise<any>;
    exports?: any;
    evaluated?: boolean;
    code?: string;
    map?: RawSourceMap;
    /**
     * Module ids that imports this module
     */
    importers?: Set<string>;
}
interface ViteNodeRunnerOptions {
    root: string;
    fetchModule: FetchFunction;
    resolveId?: ResolveIdFunction;
    createHotContext?: CreateHotContextFunction;
    base?: string;
    moduleCache?: ModuleCacheMap;
    interopDefault?: boolean;
    requestStubs?: Record<string, any>;
    debug?: boolean;
}
interface ViteNodeResolveId {
    external?: boolean | 'absolute' | 'relative';
    id: string;
    meta?: Record<string, any> | null;
    moduleSideEffects?: boolean | 'no-treeshake' | null;
    syntheticNamedExports?: boolean | string | null;
}
interface ViteNodeServerOptions {
    /**
     * Inject inline sourcemap to modules
     * @default 'inline'
     */
    sourcemap?: 'inline' | boolean;
    /**
     * Deps handling
     */
    deps?: DepsHandlingOptions;
    /**
     * Transform method for modules
     */
    transformMode?: {
        ssr?: RegExp[];
        web?: RegExp[];
    };
    debug?: DebuggerOptions;
}
interface DebuggerOptions {
    /**
     * Dump the transformed module to filesystem
     * Passing a string will dump to the specified path
     */
    dumpModules?: boolean | string;
    /**
     * Read dumpped module from filesystem whenever exists.
     * Useful for debugging by modifying the dump result from the filesystem.
     */
    loadDumppedModules?: boolean;
}

export { Arrayable as A, CreateHotContextFunction as C, DepsHandlingOptions as D, FetchResult as F, HotContext as H, ModuleCacheMap as M, Nullable as N, RawSourceMap as R, StartOfSourceMap as S, ViteNodeRunnerOptions as V, FetchFunction as a, ResolveIdFunction as b, ModuleCache as c, ViteNodeResolveId as d, ViteNodeServerOptions as e, DebuggerOptions as f, CustomEventMap as g, ViteNodeRunner as h, HMRPayload as i, DEFAULT_REQUEST_STUBS as j };
