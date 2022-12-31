import { UserConfig as UserConfig$1, ViteDevServer, CommonServerOptions, AliasOptions } from 'vite';
import { Task as Task$1, TaskResult as TaskResult$1, Bench, Options } from 'tinybench';
import { ViteNodeRunner } from 'vite-node/client';
import { ViteNodeServer } from 'vite-node/server';
import { RawSourceMap, ViteNodeResolveId, FetchFunction, ModuleCacheMap } from 'vite-node';
import { Stats } from 'node:fs';
import { MessagePort } from 'node:worker_threads';

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
declare type Colors = {
    comment: {
        close: string;
        open: string;
    };
    content: {
        close: string;
        open: string;
    };
    prop: {
        close: string;
        open: string;
    };
    tag: {
        close: string;
        open: string;
    };
    value: {
        close: string;
        open: string;
    };
};
declare type Indent = (arg0: string) => string;
declare type Refs = Array<unknown>;
declare type Print = (arg0: unknown) => string;
declare type ThemeReceived = {
    comment?: string;
    content?: string;
    prop?: string;
    tag?: string;
    value?: string;
};
declare type CompareKeys = ((a: string, b: string) => number) | undefined;
interface PrettyFormatOptions {
    callToJSON?: boolean;
    compareKeys?: CompareKeys;
    escapeRegex?: boolean;
    escapeString?: boolean;
    highlight?: boolean;
    indent?: number;
    maxDepth?: number;
    min?: boolean;
    plugins?: Plugins;
    printBasicPrototype?: boolean;
    printFunctionName?: boolean;
    theme?: ThemeReceived;
}
declare type OptionsReceived = PrettyFormatOptions;
declare type Config = {
    callToJSON: boolean;
    compareKeys: CompareKeys;
    colors: Colors;
    escapeRegex: boolean;
    escapeString: boolean;
    indent: string;
    maxDepth: number;
    min: boolean;
    plugins: Plugins;
    printBasicPrototype: boolean;
    printFunctionName: boolean;
    spacingInner: string;
    spacingOuter: string;
};
declare type Printer = (val: unknown, config: Config, indentation: string, depth: number, refs: Refs, hasCalledToJSON?: boolean) => string;
declare type Test$1 = (arg0: any) => boolean;
declare type NewPlugin = {
    serialize: (val: any, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) => string;
    test: Test$1;
};
declare type PluginOptions = {
    edgeSpacing: string;
    min: boolean;
    spacing: string;
};
declare type OldPlugin = {
    print: (val: unknown, print: Print, indent: Indent, options: PluginOptions, colors: Colors) => string;
    test: Test$1;
};
declare type Plugin = NewPlugin | OldPlugin;
declare type Plugins = Array<Plugin>;

// Type definitions for @sinonjs/fake-timers 8.1
// Project: https://github.com/sinonjs/fake-timers
// Definitions by: Wim Looman <https://github.com/Nemo157>
//                 Rogier Schouten <https://github.com/rogierschouten>
//                 Yishai Zehavi <https://github.com/zyishai>
//                 Remco Haszing <https://github.com/remcohaszing>
//                 Jaden Simon <https://github.com/JadenSimon>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

/**
 * Names of clock methods that may be faked by install.
 */
type FakeMethod =
    | 'setTimeout'
    | 'clearTimeout'
    | 'setImmediate'
    | 'clearImmediate'
    | 'setInterval'
    | 'clearInterval'
    | 'Date'
    | 'nextTick'
    | 'hrtime'
    | 'requestAnimationFrame'
    | 'cancelAnimationFrame'
    | 'requestIdleCallback'
    | 'cancelIdleCallback'
    | 'performance'
    | 'queueMicrotask';

interface FakeTimerInstallOpts {
    /**
     * Installs fake timers with the specified unix epoch (default: 0)
     */
    now?: number | Date | undefined;

    /**
     * An array with names of global methods and APIs to fake. By default, `@sinonjs/fake-timers` does not replace `nextTick()` and `queueMicrotask()`.
     * For instance, `FakeTimers.install({ toFake: ['setTimeout', 'nextTick'] })` will fake only `setTimeout()` and `nextTick()`
     */
    toFake?: FakeMethod[] | undefined;

    /**
     * The maximum number of timers that will be run when calling runAll() (default: 1000)
     */
    loopLimit?: number | undefined;

    /**
     * Tells @sinonjs/fake-timers to increment mocked time automatically based on the real system time shift (e.g. the mocked time will be incremented by
     * 20ms for every 20ms change in the real system time) (default: false)
     */
    shouldAdvanceTime?: boolean | undefined;

    /**
     * Relevant only when using with shouldAdvanceTime: true. increment mocked time by advanceTimeDelta ms every advanceTimeDelta ms change
     * in the real system time (default: 20)
     */
    advanceTimeDelta?: number | undefined;

    /**
     * Tells FakeTimers to clear 'native' (i.e. not fake) timers by delegating to their respective handlers. These are not cleared by
     * default, leading to potentially unexpected behavior if timers existed prior to installing FakeTimers. (default: false)
     */
    shouldClearNativeTimers?: boolean | undefined;
}

declare class SnapshotManager {
    options: SnapshotStateOptions;
    summary: SnapshotSummary;
    extension: string;
    constructor(options: SnapshotStateOptions);
    clear(): void;
    add(result: SnapshotResult): void;
    resolvePath(testPath: string): string;
}

interface ParsedFile extends File {
    start: number;
    end: number;
}
interface ParsedSuite extends Suite {
    start: number;
    end: number;
}
interface LocalCallDefinition {
    start: number;
    end: number;
    name: string;
    type: string;
    mode: 'run' | 'skip' | 'only' | 'todo';
    task: ParsedSuite | ParsedFile;
}
interface FileInformation {
    file: File;
    filepath: string;
    parsed: string;
    map: RawSourceMap | null;
    definitions: LocalCallDefinition[];
}

declare class TypeCheckError extends Error {
    message: string;
    stacks: ParsedStack[];
    name: string;
    constructor(message: string, stacks: ParsedStack[]);
}
interface ErrorsCache {
    files: File[];
    sourceErrors: TypeCheckError[];
}
type Callback<Args extends Array<any> = []> = (...args: Args) => Awaitable<void>;
declare class Typechecker {
    protected ctx: Vitest;
    protected files: string[];
    private _onParseStart?;
    private _onParseEnd?;
    private _onWatcherRerun?;
    private _result;
    private _tests;
    private tempConfigPath?;
    private process;
    constructor(ctx: Vitest, files: string[]);
    onParseStart(fn: Callback): void;
    onParseEnd(fn: Callback<[ErrorsCache]>): void;
    onWatcherRerun(fn: Callback): void;
    protected collectFileTests(filepath: string): Promise<FileInformation | null>;
    collectTests(): Promise<Record<string, FileInformation>>;
    protected prepareResults(output: string): Promise<{
        files: File[];
        sourceErrors: TypeCheckError[];
    }>;
    protected parseTscLikeOutput(output: string): Promise<Map<string, {
        error: TypeCheckError;
        originalError: TscErrorInfo;
    }[]>>;
    clear(): Promise<void>;
    stop(): Promise<void>;
    protected ensurePackageInstalled(root: string, checker: string): Promise<void>;
    start(): Promise<void>;
    getResult(): ErrorsCache;
    getTestFiles(): File[];
}

type RunWithFiles = (files: string[], invalidates?: string[]) => Promise<void>;
interface WorkerPool {
    runTests: RunWithFiles;
    close: () => Promise<void>;
}

interface CollectingPromise {
    promise: Promise<void>;
    resolve: () => void;
}
declare class StateManager {
    filesMap: Map<string, File>;
    pathsSet: Set<string>;
    collectingPromise: CollectingPromise | undefined;
    idMap: Map<string, Task>;
    taskFileMap: WeakMap<Task, File>;
    errorsSet: Set<unknown>;
    catchError(err: unknown, type: string): void;
    clearErrors(): void;
    getUnhandledErrors(): unknown[];
    startCollectingPaths(): void;
    finishCollectingPaths(): void;
    getPaths(): Promise<string[]>;
    getFiles(keys?: string[]): File[];
    getFilepaths(): string[];
    getFailedFilepaths(): string[];
    collectPaths(paths?: string[]): void;
    collectFiles(files?: File[]): void;
    clearFiles(paths?: string[]): void;
    updateId(task: Task): void;
    updateTasks(packs: TaskResultPack[]): void;
    updateUserLog(log: UserConsoleLog): void;
}

declare class Logger {
    ctx: Vitest;
    console: Console;
    outputStream: NodeJS.WriteStream & {
        fd: 1;
    };
    errorStream: NodeJS.WriteStream & {
        fd: 2;
    };
    logUpdate: ((...text: string[]) => void) & {
        clear(): void;
        done(): void;
    };
    private _clearScreenPending;
    constructor(ctx: Vitest, console?: Console);
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    clearFullScreen(message: string): void;
    clearScreen(message: string, force?: boolean): void;
    private _clearScreen;
    printError(err: unknown, fullStack?: boolean, type?: string): Promise<void>;
    printNoTestFound(filters?: string[]): void;
    printBanner(): void;
    printUnhandledErrors(errors: unknown[]): Promise<void>;
    printSourceTypeErrors(errors: TypeCheckError[]): Promise<void>;
}

interface SuiteResultCache {
    failed: boolean;
    duration: number;
}
declare class ResultsCache {
    private cache;
    private cachePath;
    private version;
    private root;
    getCachePath(): string | null;
    setConfig(root: string, config: ResolvedConfig['cache']): void;
    getResults(fsPath: string): SuiteResultCache | undefined;
    readFromCache(): Promise<void>;
    updateResults(files: File[]): void;
    removeFromCache(filepath: string): void;
    writeToCache(): Promise<void>;
}

interface CliOptions extends UserConfig {
    /**
     * Override the watch mode
     */
    run?: boolean;
}
/**
 * Start Vitest programmatically
 *
 * Returns a Vitest instance if initialized successfully.
 */
declare function startVitest(mode: VitestRunMode, cliFilters: string[], options: CliOptions, viteOverrides?: UserConfig$1): Promise<Vitest | undefined>;

type FileStatsCache = Pick<Stats, 'size'>;
declare class FilesStatsCache {
    cache: Map<string, FileStatsCache>;
    getStats(fsPath: string): FileStatsCache | undefined;
    updateStats(fsPath: string): Promise<void>;
    removeStats(fsPath: string): void;
}

declare class VitestCache {
    results: ResultsCache;
    stats: FilesStatsCache;
    getFileTestResults(id: string): SuiteResultCache | undefined;
    getFileStats(id: string): {
        size: number;
    } | undefined;
    static resolveCacheDir(root: string, dir: string | undefined): string;
    static clearCache(options: CliOptions): Promise<{
        dir: string;
        cleared: boolean;
    }>;
}

declare class Vitest {
    readonly mode: VitestRunMode;
    config: ResolvedConfig;
    configOverride: Partial<ResolvedConfig> | undefined;
    server: ViteDevServer;
    state: StateManager;
    snapshot: SnapshotManager;
    cache: VitestCache;
    reporters: Reporter[];
    coverageProvider: CoverageProvider | null | undefined;
    logger: Logger;
    pool: WorkerPool | undefined;
    typechecker: Typechecker | undefined;
    vitenode: ViteNodeServer;
    invalidates: Set<string>;
    changedTests: Set<string>;
    runningPromise?: Promise<void>;
    closingPromise?: Promise<void>;
    isFirstRun: boolean;
    restartsCount: number;
    runner: ViteNodeRunner;
    constructor(mode: VitestRunMode);
    private _onRestartListeners;
    private _onSetServer;
    setServer(options: UserConfig, server: ViteDevServer): Promise<void>;
    initCoverageProvider(): Promise<CoverageProvider | null | undefined>;
    getSerializableConfig(): ResolvedConfig;
    typecheck(filters?: string[]): Promise<void>;
    start(filters?: string[]): Promise<void>;
    private getTestDependencies;
    filterTestsBySource(tests: string[]): Promise<string[]>;
    runFiles(paths: string[]): Promise<void>;
    rerunFiles(files?: string[], trigger?: string): Promise<void>;
    changeNamePattern(pattern: string, files?: string[], trigger?: string): Promise<void>;
    changeFilenamePattern(pattern: string): Promise<void>;
    rerunFailed(): Promise<void>;
    updateSnapshot(files?: string[]): Promise<void>;
    private _rerunTimer;
    private scheduleRerun;
    private unregisterWatcher;
    private registerWatcher;
    /**
     * @returns A value indicating whether rerun is needed (changedTests was mutated)
     */
    private handleFileChanged;
    close(): Promise<void>;
    /**
     * Close the thread pool and exit the process
     */
    exit(force?: boolean): Promise<void>;
    report<T extends keyof Reporter>(name: T, ...args: ArgumentsType$1<Reporter[T]>): Promise<void>;
    globTestFiles(filters?: string[]): Promise<string[]>;
    isTargetFile(id: string, source?: string): Promise<boolean>;
    isInSourceTestFile(code: string): boolean;
    onServerRestart(fn: OnServerRestartHandler): void;
    onAfterSetServer(fn: OnServerRestartHandler): void;
}

type MockMap = Map<string, Record<string, string | null | (() => unknown)>>;

interface TestSequencer {
    /**
     * Slicing tests into shards. Will be run before `sort`.
     * Only run, if `shard` is defined.
     */
    shard(files: string[]): Awaitable<string[]>;
    sort(files: string[]): Awaitable<string[]>;
}
interface TestSequencerConstructor {
    new (ctx: Vitest): TestSequencer;
}

declare abstract class BaseReporter implements Reporter {
    start: number;
    end: number;
    watchFilters?: string[];
    isTTY: false;
    ctx: Vitest;
    private _filesInWatchMode;
    private _lastRunTimeout;
    private _lastRunTimer;
    private _lastRunCount;
    private _timeStart;
    constructor();
    get mode(): VitestRunMode;
    onInit(ctx: Vitest): void;
    relative(path: string): string;
    onFinished(files?: File[], errors?: unknown[]): Promise<void>;
    onTaskUpdate(packs: TaskResultPack[]): void;
    onWatcherStart(files?: File[], errors?: unknown[]): Promise<void>;
    private resetLastRunLog;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
    shouldLog(log: UserConsoleLog): boolean;
    onServerRestart(reason?: string): void;
    reportSummary(files: File[]): Promise<void>;
    reportTestSummary(files: File[]): Promise<void>;
    private printErrorsSummary;
    reportBenchmarkSummary(files: File[]): Promise<void>;
    private printTaskErrors;
    registerUnhandledRejection(): void;
}

interface ListRendererOptions$1 {
    renderSucceed?: boolean;
    logger: Logger;
    showHeap: boolean;
    mode: VitestRunMode;
}
declare const createListRenderer: (_tasks: Task[], options: ListRendererOptions$1) => {
    start(): any;
    update(_tasks: Task[]): any;
    stop(): Promise<any>;
    clear(): void;
};

declare class DefaultReporter extends BaseReporter {
    renderer?: ReturnType<typeof createListRenderer>;
    rendererOptions: ListRendererOptions$1;
    onTestRemoved(trigger?: string): Promise<void>;
    onCollected(): void;
    onFinished(files?: File[], errors?: unknown[]): Promise<void>;
    onWatcherStart(files?: File[], errors?: unknown[]): Promise<void>;
    stopListRender(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}

declare class DotReporter extends BaseReporter {
    renderer?: ReturnType<typeof createListRenderer>;
    onCollected(): void;
    onFinished(files?: File[], errors?: unknown[]): Promise<void>;
    onWatcherStart(): Promise<void>;
    stopListRender(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}

interface Callsite {
    line: number;
    column: number;
}
declare class JsonReporter$1 implements Reporter {
    start: number;
    ctx: Vitest;
    onInit(ctx: Vitest): void;
    protected logTasks(files: File[]): Promise<void>;
    onFinished(files?: File[]): Promise<void>;
    /**
     * Writes the report to an output file if specified in the config,
     * or logs it to the console otherwise.
     * @param report
     */
    writeReport(report: string): Promise<void>;
    protected getFailureLocation(test: Task): Promise<Callsite | undefined>;
}

declare class VerboseReporter extends DefaultReporter {
    constructor();
    onTaskUpdate(packs: TaskResultPack[]): void;
}

declare class TapReporter implements Reporter {
    protected ctx: Vitest;
    private logger;
    onInit(ctx: Vitest): void;
    static getComment(task: Task): string;
    private logErrorDetails;
    protected logTasks(tasks: Task[]): void;
    onFinished(files?: File[]): Promise<void>;
}

declare class JUnitReporter implements Reporter {
    private ctx;
    private reportFile?;
    private baseLog;
    private logger;
    private _timeStart;
    onInit(ctx: Vitest): Promise<void>;
    writeElement(name: string, attrs: Record<string, any>, children: () => Promise<void>): Promise<void>;
    writeErrorDetails(error: ErrorWithDiff): Promise<void>;
    writeLogs(task: Task, type: 'err' | 'out'): Promise<void>;
    writeTasks(tasks: Task[], filename: string): Promise<void>;
    onFinished(files?: File[]): Promise<void>;
}

declare class TapFlatReporter extends TapReporter {
    onInit(ctx: Vitest): void;
    onFinished(files?: File[]): Promise<void>;
}

declare class JsonReporter implements Reporter {
    start: number;
    ctx: Vitest;
    onInit(ctx: Vitest): void;
    protected logTasks(files: File[]): Promise<void>;
    onFinished(files?: File[]): Promise<void>;
    /**
     * Writes the report to an output file if specified in the config,
     * or logs it to the console otherwise.
     * @param report
     */
    writeReport(report: string): Promise<void>;
}

interface ListRendererOptions {
    renderSucceed?: boolean;
    logger: Logger;
    showHeap: boolean;
}
declare const createTableRenderer: (_tasks: Task[], options: ListRendererOptions) => {
    start(): any;
    update(_tasks: Task[]): any;
    stop(): Promise<any>;
    clear(): void;
};

declare class TableReporter extends BaseReporter {
    renderer?: ReturnType<typeof createTableRenderer>;
    rendererOptions: ListRendererOptions$1;
    onTestRemoved(trigger?: string): Promise<void>;
    onCollected(): void;
    onFinished(files?: File[], errors?: unknown[]): Promise<void>;
    onWatcherStart(): Promise<void>;
    stopListRender(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}

declare const BenchmarkReportsMap: {
    default: typeof TableReporter;
    verbose: typeof VerboseReporter;
    json: typeof JsonReporter;
};
type BenchmarkBuiltinReporters = keyof typeof BenchmarkReportsMap;

declare const ReportersMap: {
    default: typeof DefaultReporter;
    verbose: typeof VerboseReporter;
    dot: typeof DotReporter;
    json: typeof JsonReporter$1;
    tap: typeof TapReporter;
    'tap-flat': typeof TapFlatReporter;
    junit: typeof JUnitReporter;
};
type BuiltinReporters = keyof typeof ReportersMap;

interface RollupError extends RollupLogProps {
	parserError?: Error;
	stack?: string;
	watchFiles?: string[];
}

interface RollupWarning extends RollupLogProps {
	chunkName?: string;
	cycle?: string[];
	exportName?: string;
	exporter?: string;
	guess?: string;
	importer?: string;
	missing?: string;
	modules?: string[];
	names?: string[];
	reexporter?: string;
	source?: string;
	sources?: string[];
}

interface RollupLogProps {
	code?: string;
	frame?: string;
	hook?: string;
	id?: string;
	loc?: {
		column: number;
		file?: string;
		line: number;
	};
	message: string;
	name?: string;
	plugin?: string;
	pluginCode?: string;
	pos?: number;
	url?: string;
}

interface ExistingRawSourceMap {
	file?: string;
	mappings: string;
	names: string[];
	sourceRoot?: string;
	sources: string[];
	sourcesContent?: string[];
	version: number;
}

interface SourceMap {
	file: string;
	mappings: string;
	names: string[];
	sources: string[];
	sourcesContent: string[];
	version: number;
	toString(): string;
	toUrl(): string;
}

type SourceMapInput = ExistingRawSourceMap | string | null | { mappings: '' };

type PartialNull<T> = {
	[P in keyof T]: T[P] | null;
};

interface ModuleOptions {
	meta: CustomPluginOptions;
	moduleSideEffects: boolean | 'no-treeshake';
	syntheticNamedExports: boolean | string;
}

interface SourceDescription extends Partial<PartialNull<ModuleOptions>> {
	ast?: AcornNode;
	code: string;
	map?: SourceMapInput;
}

interface PluginCache {
	delete(id: string): boolean;
	get<T = any>(id: string): T;
	has(id: string): boolean;
	set<T = any>(id: string, value: T): void;
}

interface MinimalPluginContext {
	meta: PluginContextMeta;
}

interface EmittedAsset {
	fileName?: string;
	name?: string;
	source?: string | Uint8Array;
	type: 'asset';
}

interface EmittedChunk {
	fileName?: string;
	id: string;
	implicitlyLoadedAfterOneOf?: string[];
	importer?: string;
	name?: string;
	preserveSignature?: PreserveEntrySignaturesOption;
	type: 'chunk';
}

type EmittedFile = EmittedAsset | EmittedChunk;

type EmitAsset = (name: string, source?: string | Uint8Array) => string;

type EmitChunk = (id: string, options?: { name?: string }) => string;

type EmitFile = (emittedFile: EmittedFile) => string;

interface ModuleInfo extends ModuleOptions {
	ast: AcornNode | null;
	code: string | null;
	dynamicImporters: readonly string[];
	dynamicallyImportedIdResolutions: readonly ResolvedId[];
	dynamicallyImportedIds: readonly string[];
	hasDefaultExport: boolean | null;
	/** @deprecated Use `moduleSideEffects` instead */
	hasModuleSideEffects: boolean | 'no-treeshake';
	id: string;
	implicitlyLoadedAfterOneOf: readonly string[];
	implicitlyLoadedBefore: readonly string[];
	importedIdResolutions: readonly ResolvedId[];
	importedIds: readonly string[];
	importers: readonly string[];
	isEntry: boolean;
	isExternal: boolean;
	isIncluded: boolean | null;
}

type GetModuleInfo = (moduleId: string) => ModuleInfo | null;

interface CustomPluginOptions {
	[plugin: string]: any;
}

interface PluginContext extends MinimalPluginContext {
	addWatchFile: (id: string) => void;
	cache: PluginCache;
	/** @deprecated Use `this.emitFile` instead */
	emitAsset: EmitAsset;
	/** @deprecated Use `this.emitFile` instead */
	emitChunk: EmitChunk;
	emitFile: EmitFile;
	error: (err: RollupError | string, pos?: number | { column: number; line: number }) => never;
	/** @deprecated Use `this.getFileName` instead */
	getAssetFileName: (assetReferenceId: string) => string;
	/** @deprecated Use `this.getFileName` instead */
	getChunkFileName: (chunkReferenceId: string) => string;
	getFileName: (fileReferenceId: string) => string;
	getModuleIds: () => IterableIterator<string>;
	getModuleInfo: GetModuleInfo;
	getWatchFiles: () => string[];
	/** @deprecated Use `this.resolve` instead */
	isExternal: IsExternal;
	load: (
		options: { id: string; resolveDependencies?: boolean } & Partial<PartialNull<ModuleOptions>>
	) => Promise<ModuleInfo>;
	/** @deprecated Use `this.getModuleIds` instead */
	moduleIds: IterableIterator<string>;
	parse: (input: string, options?: any) => AcornNode;
	resolve: (
		source: string,
		importer?: string,
		options?: { custom?: CustomPluginOptions; isEntry?: boolean; skipSelf?: boolean }
	) => Promise<ResolvedId | null>;
	/** @deprecated Use `this.resolve` instead */
	resolveId: (source: string, importer?: string) => Promise<string | null>;
	setAssetSource: (assetReferenceId: string, source: string | Uint8Array) => void;
	warn: (warning: RollupWarning | string, pos?: number | { column: number; line: number }) => void;
}

interface PluginContextMeta {
	rollupVersion: string;
	watchMode: boolean;
}

interface ResolvedId extends ModuleOptions {
	external: boolean | 'absolute';
	id: string;
}

type IsExternal = (
	source: string,
	importer: string | undefined,
	isResolved: boolean
) => boolean;

interface TransformPluginContext extends PluginContext {
	getCombinedSourcemap: () => SourceMap;
}

type TransformResult = string | null | void | Partial<SourceDescription>;
type PreserveEntrySignaturesOption = false | 'strict' | 'allow-extension' | 'exports-only';

interface AcornNode {
	end: number;
	start: number;
	type: string;
}

type Awaitable<T> = T | PromiseLike<T>;
type Nullable<T> = T | null | undefined;
type Arrayable<T> = T | Array<T>;
type ArgumentsType$1<T> = T extends (...args: infer U) => any ? U : never;
type MergeInsertions<T> = T extends object ? {
    [K in keyof T]: MergeInsertions<T[K]>;
} : T;
type DeepMerge<F, S> = MergeInsertions<{
    [K in keyof F | keyof S]: K extends keyof S & keyof F ? DeepMerge<F[K], S[K]> : K extends keyof S ? S[K] : K extends keyof F ? F[K] : never;
}>;
type MutableArray<T extends readonly any[]> = {
    -readonly [k in keyof T]: T[k];
};
interface Constructable {
    new (...args: any[]): any;
}
interface ModuleCache {
    promise?: Promise<any>;
    exports?: any;
    code?: string;
}
interface EnvironmentReturn {
    teardown: (global: any) => Awaitable<void>;
}
interface Environment {
    name: string;
    setup(global: any, options: Record<string, any>): Awaitable<EnvironmentReturn>;
}
interface UserConsoleLog {
    content: string;
    type: 'stdout' | 'stderr';
    taskId?: string;
    time: number;
    size: number;
}
interface Position {
    source?: string;
    line: number;
    column: number;
}
interface ParsedStack {
    method: string;
    file: string;
    line: number;
    column: number;
    sourcePos?: Position;
}
interface ErrorWithDiff extends Error {
    name: string;
    nameStr?: string;
    stack?: string;
    stackStr?: string;
    stacks?: ParsedStack[];
    showDiff?: boolean;
    actual?: any;
    expected?: any;
    operator?: string;
    type?: string;
    frame?: string;
}
interface ModuleGraphData {
    graph: Record<string, string[]>;
    externalized: string[];
    inlined: string[];
}
type OnServerRestartHandler = (reason?: string) => Promise<void> | void;

declare type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;
declare type ReturnType$1<T> = T extends (...args: any) => infer R ? R : never;
declare type PromisifyFn<T> = ReturnType$1<T> extends Promise<any> ? T : (...args: ArgumentsType<T>) => Promise<Awaited<ReturnType$1<T>>>;
declare type BirpcFn<T> = PromisifyFn<T> & {
    /**
     * Send event without asking for response
     */
    asEvent(...args: ArgumentsType<T>): void;
};
declare type BirpcReturn<RemoteFunctions> = {
    [K in keyof RemoteFunctions]: BirpcFn<RemoteFunctions[K]>;
};

type ChainableFunction<T extends string, Args extends any[], R = any, E = {}> = {
    (...args: Args): R;
} & {
    [x in T]: ChainableFunction<T, Args, R, E>;
} & {
    fn: (this: Record<T, boolean | undefined>, ...args: Args) => R;
} & E;

interface BenchmarkUserOptions {
    /**
     * Include globs for benchmark test files
     *
     * @default ['**\/*.{bench,benchmark}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
     */
    include?: string[];
    /**
     * Exclude globs for benchmark test files
     * @default ['node_modules', 'dist', '.idea', '.git', '.cache']
     */
    exclude?: string[];
    /**
     * Include globs for in-source benchmark test files
     *
     * @default []
     */
    includeSource?: string[];
    /**
     * Custom reporter for output. Can contain one or more built-in report names, reporter instances,
     * and/or paths to custom reporters
     */
    reporters?: Arrayable<BenchmarkBuiltinReporters | Reporter>;
    /**
     * Write test results to a file when the `--reporter=json` option is also specified.
     * Also definable individually per reporter by using an object instead.
     */
    outputFile?: string | (Partial<Record<BenchmarkBuiltinReporters, string>> & Record<string, string>);
}
interface Benchmark extends TaskBase {
    type: 'benchmark';
    suite: Suite;
    result?: TaskResult;
    fails?: boolean;
    task?: Task$1;
}
interface BenchmarkResult extends TaskResult$1 {
    name: string;
    rank: number;
}
type BenchFunction = (this: Bench) => Promise<void> | void;
type BenchmarkAPI = ChainableFunction<'skip' | 'only' | 'todo', [
    name: string,
    fn?: BenchFunction,
    options?: Options
], void> & {
    skipIf(condition: any): BenchmarkAPI;
    runIf(condition: any): BenchmarkAPI;
};

type RunMode = 'run' | 'skip' | 'only' | 'todo';
type TaskState = RunMode | 'pass' | 'fail';
interface TaskBase {
    id: string;
    name: string;
    mode: RunMode;
    concurrent?: boolean;
    shuffle?: boolean;
    suite?: Suite;
    file?: File;
    result?: TaskResult;
    retry?: number;
    logs?: UserConsoleLog[];
}
interface TaskResult {
    state: TaskState;
    duration?: number;
    startTime?: number;
    heap?: number;
    error?: ErrorWithDiff;
    htmlError?: string;
    hooks?: Partial<Record<keyof SuiteHooks, TaskState>>;
    benchmark?: BenchmarkResult;
    retryCount?: number;
}
type TaskResultPack = [id: string, result: TaskResult | undefined];
interface Suite extends TaskBase {
    type: 'suite';
    tasks: Task[];
    filepath?: string;
    benchmark?: Bench;
    projectName?: string;
}
interface File extends Suite {
    filepath: string;
    collectDuration?: number;
    setupDuration?: number;
}
interface Test<ExtraContext = {}> extends TaskBase {
    type: 'test';
    suite: Suite;
    result?: TaskResult;
    fails?: boolean;
    context: TestContext & ExtraContext;
    onFailed?: OnTestFailedHandler[];
}
interface TypeCheck extends TaskBase {
    type: 'typecheck';
}
type Task = Test | Suite | File | Benchmark | TypeCheck;
type DoneCallback = (error?: any) => void;
type TestFunction<ExtraContext = {}> = (context: TestContext & ExtraContext) => Awaitable<any> | void;
type ExtractEachCallbackArgs<T extends ReadonlyArray<any>> = {
    1: [T[0]];
    2: [T[0], T[1]];
    3: [T[0], T[1], T[2]];
    4: [T[0], T[1], T[2], T[3]];
    5: [T[0], T[1], T[2], T[3], T[4]];
    6: [T[0], T[1], T[2], T[3], T[4], T[5]];
    7: [T[0], T[1], T[2], T[3], T[4], T[5], T[6]];
    8: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7]];
    9: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8]];
    10: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8], T[9]];
    fallback: Array<T extends ReadonlyArray<infer U> ? U : any>;
}[T extends Readonly<[any]> ? 1 : T extends Readonly<[any, any]> ? 2 : T extends Readonly<[any, any, any]> ? 3 : T extends Readonly<[any, any, any, any]> ? 4 : T extends Readonly<[any, any, any, any, any]> ? 5 : T extends Readonly<[any, any, any, any, any, any]> ? 6 : T extends Readonly<[any, any, any, any, any, any, any]> ? 7 : T extends Readonly<[any, any, any, any, any, any, any, any]> ? 8 : T extends Readonly<[any, any, any, any, any, any, any, any, any]> ? 9 : T extends Readonly<[any, any, any, any, any, any, any, any, any, any]> ? 10 : 'fallback'];
interface SuiteEachFunction {
    <T extends any[] | [any]>(cases: ReadonlyArray<T>): (name: string, fn: (...args: T) => Awaitable<void>) => void;
    <T extends ReadonlyArray<any>>(cases: ReadonlyArray<T>): (name: string, fn: (...args: ExtractEachCallbackArgs<T>) => Awaitable<void>) => void;
    <T>(cases: ReadonlyArray<T>): (name: string, fn: (...args: T[]) => Awaitable<void>) => void;
}
interface TestEachFunction {
    <T extends any[] | [any]>(cases: ReadonlyArray<T>): (name: string, fn: (...args: T) => Awaitable<void>, options?: number | TestOptions) => void;
    <T extends ReadonlyArray<any>>(cases: ReadonlyArray<T>): (name: string, fn: (...args: ExtractEachCallbackArgs<T>) => Awaitable<void>, options?: number | TestOptions) => void;
    <T>(cases: ReadonlyArray<T>): (name: string, fn: (...args: T[]) => Awaitable<void>, options?: number | TestOptions) => void;
    (...args: [TemplateStringsArray, ...any]): (name: string, fn: (...args: any[]) => Awaitable<void>, options?: number | TestOptions) => void;
}
type ChainableTestAPI<ExtraContext = {}> = ChainableFunction<'concurrent' | 'only' | 'skip' | 'todo' | 'fails', [
    name: string,
    fn?: TestFunction<ExtraContext>,
    options?: number | TestOptions
], void, {
    each: TestEachFunction;
    <T extends ExtraContext>(name: string, fn?: TestFunction<T>, options?: number | TestOptions): void;
}>;
interface TestOptions {
    /**
     * Test timeout.
     */
    timeout?: number;
    /**
     * Times to retry the test if fails. Useful for making flaky tests more stable.
     * When retries is up, the last test error will be thrown.
     *
     * @default 1
     */
    retry?: number;
}
type TestAPI<ExtraContext = {}> = ChainableTestAPI<ExtraContext> & {
    each: TestEachFunction;
    skipIf(condition: any): ChainableTestAPI<ExtraContext>;
    runIf(condition: any): ChainableTestAPI<ExtraContext>;
};
type ChainableSuiteAPI<ExtraContext = {}> = ChainableFunction<'concurrent' | 'only' | 'skip' | 'todo' | 'shuffle', [
    name: string,
    factory?: SuiteFactory<ExtraContext>,
    options?: number | TestOptions
], SuiteCollector<ExtraContext>, {
    each: TestEachFunction;
    <T extends ExtraContext>(name: string, factory?: SuiteFactory<T>): SuiteCollector<T>;
}>;
type SuiteAPI<ExtraContext = {}> = ChainableSuiteAPI<ExtraContext> & {
    each: SuiteEachFunction;
    skipIf(condition: any): ChainableSuiteAPI<ExtraContext>;
    runIf(condition: any): ChainableSuiteAPI<ExtraContext>;
};
type HookListener<T extends any[], Return = void> = (...args: T) => Awaitable<Return>;
type HookCleanupCallback = (() => Awaitable<unknown>) | void;
interface SuiteHooks<ExtraContext = {}> {
    beforeAll: HookListener<[Suite | File], HookCleanupCallback>[];
    afterAll: HookListener<[Suite | File]>[];
    beforeEach: HookListener<[TestContext & ExtraContext, Suite], HookCleanupCallback>[];
    afterEach: HookListener<[TestContext & ExtraContext, Suite]>[];
}
interface SuiteCollector<ExtraContext = {}> {
    readonly name: string;
    readonly mode: RunMode;
    type: 'collector';
    test: TestAPI<ExtraContext>;
    benchmark: BenchmarkAPI;
    tasks: (Suite | Test | Benchmark | SuiteCollector<ExtraContext>)[];
    collect: (file?: File) => Promise<Suite>;
    clear: () => void;
    on: <T extends keyof SuiteHooks<ExtraContext>>(name: T, ...fn: SuiteHooks<ExtraContext>[T]) => void;
}
type SuiteFactory<ExtraContext = {}> = (test: (name: string, fn: TestFunction<ExtraContext>) => void) => Awaitable<void>;
interface RuntimeContext {
    tasks: (SuiteCollector | Test)[];
    currentSuite: SuiteCollector | null;
}
interface TestContext {
    /**
     * Metadata of the current test
     */
    meta: Readonly<Test>;
    /**
     * A expect instance bound to the test
     */
    expect: Vi.ExpectStatic;
    /**
     * Extract hooks on test failed
     */
    onTestFailed: (fn: OnTestFailedHandler) => void;
}
type OnTestFailedHandler = (result: TaskResult) => Awaitable<void>;

type SnapshotData = Record<string, string>;
type SnapshotUpdateState = 'all' | 'new' | 'none';
interface SnapshotStateOptions {
    updateSnapshot: SnapshotUpdateState;
    expand?: boolean;
    snapshotFormat?: OptionsReceived;
    resolveSnapshotPath?: (path: string, extension: string) => string;
}
interface SnapshotMatchOptions {
    testName: string;
    received: unknown;
    key?: string;
    inlineSnapshot?: string;
    isInline: boolean;
    error?: Error;
}
interface SnapshotResult {
    filepath: string;
    added: number;
    fileDeleted: boolean;
    matched: number;
    unchecked: number;
    uncheckedKeys: Array<string>;
    unmatched: number;
    updated: number;
}
interface UncheckedSnapshot {
    filePath: string;
    keys: Array<string>;
}
interface SnapshotSummary {
    added: number;
    didUpdate: boolean;
    failure: boolean;
    filesAdded: number;
    filesRemoved: number;
    filesRemovedList: Array<string>;
    filesUnmatched: number;
    filesUpdated: number;
    matched: number;
    total: number;
    unchecked: number;
    uncheckedKeysByFile: Array<UncheckedSnapshot>;
    unmatched: number;
    updated: number;
}

interface WorkerContext {
    workerId: number;
    port: MessagePort;
    config: ResolvedConfig;
    files: string[];
    invalidates?: string[];
}
type ResolveIdFunction = (id: string, importer?: string) => Promise<ViteNodeResolveId | null>;
interface AfterSuiteRunMeta {
    coverage?: unknown;
}
interface WorkerRPC {
    fetch: FetchFunction;
    resolveId: ResolveIdFunction;
    getSourceMap: (id: string, force?: boolean) => Promise<RawSourceMap | undefined>;
    onFinished: (files: File[], errors?: unknown[]) => void;
    onWorkerExit: (code?: number) => void;
    onPathsCollected: (paths: string[]) => void;
    onUserConsoleLog: (log: UserConsoleLog) => void;
    onUnhandledRejection: (err: unknown) => void;
    onCollected: (files: File[]) => void;
    onAfterSuiteRun: (meta: AfterSuiteRunMeta) => void;
    onTaskUpdate: (pack: TaskResultPack[]) => void;
    snapshotSaved: (snapshot: SnapshotResult) => void;
    resolveSnapshotPath: (testPath: string) => string;
}
interface WorkerGlobalState {
    ctx: WorkerContext;
    config: ResolvedConfig;
    rpc: BirpcReturn<WorkerRPC>;
    current?: Test;
    filepath?: string;
    moduleCache: ModuleCacheMap;
    browserHashMap?: Map<string, string>;
    mockMap: MockMap;
}

interface CoverageProvider {
    name: string;
    initialize(ctx: Vitest): Promise<void> | void;
    resolveOptions(): ResolvedCoverageOptions;
    clean(clean?: boolean): void | Promise<void>;
    onBeforeFilesRun?(): void | Promise<void>;
    onAfterSuiteRun(meta: AfterSuiteRunMeta): void | Promise<void>;
    reportCoverage(): void | Promise<void>;
    onFileTransform?(sourceCode: string, id: string, pluginCtx: TransformPluginContext): TransformResult | Promise<TransformResult>;
}
interface CoverageProviderModule {
    /**
     * Factory for creating a new coverage provider
     */
    getProvider(): CoverageProvider | Promise<CoverageProvider>;
    /**
     * Executed on after each run in the worker thread. Possible to return a payload passed to the provider
     */
    takeCoverage?(): unknown | Promise<unknown>;
}
type CoverageReporter = 'clover' | 'cobertura' | 'html-spa' | 'html' | 'json-summary' | 'json' | 'lcov' | 'lcovonly' | 'none' | 'teamcity' | 'text-lcov' | 'text-summary' | 'text';
type CoverageOptions = BaseCoverageOptions & {
    provider?: null | CoverageProviderModule;
} | CoverageC8Options & {
    provider?: 'c8';
} | CoverageIstanbulOptions & {
    provider?: 'istanbul';
};
type ResolvedCoverageOptions = {
    tempDirectory: string;
} & Required<CoverageOptions>;
interface BaseCoverageOptions {
    /**
     * Enables coverage collection. Can be overriden using `--coverage` CLI option.
     *
     * @default false
     */
    enabled?: boolean;
    /**
     * List of files included in coverage as glob patterns
     *
     * @default ['**']
     */
    include?: string[];
    /**
      * Extensions for files to be included in coverage
      *
      * @default ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte']
      */
    extension?: string | string[];
    /**
      * List of files excluded from coverage as glob patterns
      */
    exclude?: string[];
    /**
     * Whether to include all files, including the untested ones into report
     *
     * @default false
     */
    all?: boolean;
    /**
     * Clean coverage results before running tests
     *
     * @default true
     */
    clean?: boolean;
    /**
     * Clean coverage report on watch rerun
     *
     * @default false
     */
    cleanOnRerun?: boolean;
    /**
     * Directory to write coverage report to
     */
    reportsDirectory?: string;
    /**
     * Coverage reporters to use.
     * See [istanbul documentation](https://istanbul.js.org/docs/advanced/alternative-reporters/) for detailed list of all reporters.
     *
     * @default ['text', 'html', 'clover', 'json']
     */
    reporter?: Arrayable<CoverageReporter>;
    /**
     * Do not show files with 100% statement, branch, and function coverage
     *
     * @default false
     */
    skipFull?: boolean;
    /**
     * Check thresholds per file.
     * See `lines`, `functions`, `branches` and `statements` for the actual thresholds.
     *
     * @default false
     */
    perFile?: boolean;
    /**
     * Threshold for lines
     *
     * @default undefined
     */
    lines?: number;
    /**
     * Threshold for functions
     *
     * @default undefined
     */
    functions?: number;
    /**
     * Threshold for branches
     *
     * @default undefined
     */
    branches?: number;
    /**
     * Threshold for statements
     *
     * @default undefined
     */
    statements?: number;
}
interface CoverageIstanbulOptions extends BaseCoverageOptions {
    /**
     * Set to array of class method names to ignore for coverage
     *
     * @default []
     */
    ignoreClassMethods?: string[];
    /**
     * Watermarks for statements, lines, branches and functions.
     *
     * Default value is `[50,80]` for each property.
     */
    watermarks?: {
        statements?: [number, number];
        functions?: [number, number];
        branches?: [number, number];
        lines?: [number, number];
    };
}
interface CoverageC8Options extends BaseCoverageOptions {
    /**
     * Allow files from outside of your cwd.
     *
     * @default false
     */
    allowExternal?: boolean;
    /**
     * Exclude coverage under `/node_modules/`
     *
     * @default true
     */
    excludeNodeModules?: boolean;
    /**
     * Specifies the directories that are used when `--all` is enabled.
     *
     * @default cwd
    */
    src?: string[];
    /**
     * Shortcut for `--check-coverage --lines 100 --functions 100 --branches 100 --statements 100`
     *
     * @default false
     */
    100?: boolean;
}

interface JSDOMOptions {
    /**
     * The html content for the test.
     *
     * @default '<!DOCTYPE html>'
     */
    html?: string | Buffer | ArrayBufferLike;
    /**
     * referrer just affects the value read from document.referrer.
     * It defaults to no referrer (which reflects as the empty string).
     */
    referrer?: string;
    /**
     * userAgent affects the value read from navigator.userAgent, as well as the User-Agent header sent while fetching subresources.
     *
     * @default `Mozilla/5.0 (${process.platform}) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/${jsdomVersion}`
     */
    userAgent?: string;
    /**
     * url sets the value returned by window.location, document.URL, and document.documentURI,
     * and affects things like resolution of relative URLs within the document
     * and the same-origin restrictions and referrer used while fetching subresources.
     *
     * @default 'http://localhost:3000'.
     */
    url?: string;
    /**
     * contentType affects the value read from document.contentType, and how the document is parsed: as HTML or as XML.
     * Values that are not "text/html" or an XML mime type will throw.
     *
     * @default 'text/html'.
     */
    contentType?: string;
    /**
     * The maximum size in code units for the separate storage areas used by localStorage and sessionStorage.
     * Attempts to store data larger than this limit will cause a DOMException to be thrown. By default, it is set
     * to 5,000,000 code units per origin, as inspired by the HTML specification.
     *
     * @default 5_000_000
     */
    storageQuota?: number;
    /**
     * Enable console?
     *
     * @default false
     */
    console?: boolean;
    /**
     * jsdom does not have the capability to render visual content, and will act like a headless browser by default.
     * It provides hints to web pages through APIs such as document.hidden that their content is not visible.
     *
     * When the `pretendToBeVisual` option is set to `true`, jsdom will pretend that it is rendering and displaying
     * content.
     *
     * @default true
     */
    pretendToBeVisual?: boolean;
    /**
     * `includeNodeLocations` preserves the location info produced by the HTML parser,
     * allowing you to retrieve it with the nodeLocation() method (described below).
     *
     * It defaults to false to give the best performance,
     * and cannot be used with an XML content type since our XML parser does not support location info.
     *
     * @default false
     */
    includeNodeLocations?: boolean | undefined;
    /**
     * @default 'dangerously'
     */
    runScripts?: 'dangerously' | 'outside-only';
    /**
     * Enable CookieJar
     *
     * @default false
     */
    cookieJar?: boolean;
    resources?: 'usable' | any;
}

interface Reporter {
    onInit?(ctx: Vitest): void;
    onPathsCollected?: (paths?: string[]) => Awaitable<void>;
    onCollected?: (files?: File[]) => Awaitable<void>;
    onFinished?: (files?: File[], errors?: unknown[]) => Awaitable<void>;
    onTaskUpdate?: (packs: TaskResultPack[]) => Awaitable<void>;
    onTestRemoved?: (trigger?: string) => Awaitable<void>;
    onWatcherStart?: (files?: File[], errors?: unknown[]) => Awaitable<void>;
    onWatcherRerun?: (files: string[], trigger?: string) => Awaitable<void>;
    onServerRestart?: (reason?: string) => Awaitable<void>;
    onUserConsoleLog?: (log: UserConsoleLog) => Awaitable<void>;
}

type BuiltinEnvironment = 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime';
type VitestEnvironment = BuiltinEnvironment | (string & Record<never, never>);
type CSSModuleScopeStrategy = 'stable' | 'scoped' | 'non-scoped';
type SequenceHooks = 'stack' | 'list' | 'parallel';
type ApiConfig = Pick<CommonServerOptions, 'port' | 'strictPort' | 'host'>;

interface EnvironmentOptions {
    /**
     * jsdom options.
     */
    jsdom?: JSDOMOptions;
    [x: string]: unknown;
}
type VitestRunMode = 'test' | 'benchmark' | 'typecheck';
interface InlineConfig {
    /**
     * Name of the project. Will be used to display in the reporter.
     */
    name?: string;
    /**
     * Benchmark options.
     *
     * @default {}
    */
    benchmark?: BenchmarkUserOptions;
    /**
     * Include globs for test files
     *
     * @default ['**\/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
     */
    include?: string[];
    /**
     * Exclude globs for test files
     * @default ['node_modules', 'dist', '.idea', '.git', '.cache']
     */
    exclude?: string[];
    /**
     * Include globs for in-source test files
     *
     * @default []
     */
    includeSource?: string[];
    /**
     * Handling for dependencies inlining or externalizing
     */
    deps?: {
        /**
         * Externalize means that Vite will bypass the package to native Node.
         *
         * Externalized dependencies will not be applied Vite's transformers and resolvers.
         * And does not support HMR on reload.
         *
         * Typically, packages under `node_modules` are externalized.
         */
        external?: (string | RegExp)[];
        /**
         * Vite will process inlined modules.
         *
         * This could be helpful to handle packages that ship `.js` in ESM format (that Node can't handle).
         *
         * If `true`, every dependency will be inlined
         */
        inline?: (string | RegExp)[] | true;
        /**
         * Interpret CJS module's default as named exports
         *
         * @default true
         */
        interopDefault?: boolean;
        /**
         * When a dependency is a valid ESM package, try to guess the cjs version based on the path.
         * This will significantly improve the performance in huge repo, but might potentially
         * cause some misalignment if a package have different logic in ESM and CJS mode.
         *
         * @default false
         */
        fallbackCJS?: boolean;
        /**
         * Use experimental Node loader to resolve imports inside node_modules using Vite resolve algorithm.
         * @default false
         */
        registerNodeLoader?: boolean;
    };
    /**
     * Base directory to scan for the test files
     *
     * @default `config.root`
     */
    dir?: string;
    /**
    * Register apis globally
    *
    * @default false
    */
    globals?: boolean;
    /**
     * Running environment
     *
     * Supports 'node', 'jsdom', 'happy-dom', 'edge-runtime'
     *
     * If used unsupported string, will try to load the package `vitest-environment-${env}`
     *
     * @default 'node'
     */
    environment?: VitestEnvironment;
    /**
     * Environment options.
     */
    environmentOptions?: EnvironmentOptions;
    /**
     * Update snapshot
     *
     * @default false
     */
    update?: boolean;
    /**
     * Watch mode
     *
     * @default true
     */
    watch?: boolean;
    /**
     * Project root
     *
     * @default process.cwd()
     */
    root?: string;
    /**
     * Custom reporter for output. Can contain one or more built-in report names, reporter instances,
     * and/or paths to custom reporters.
     */
    reporters?: Arrayable<BuiltinReporters | 'html' | Reporter | Omit<string, BuiltinReporters>>;
    /**
     * Truncates lines in the output to the given length.
     * @default stdout.columns || 80
     */
    outputTruncateLength?: number;
    /**
     * Maximum number of line to show in a single diff.
     * @default 15
     */
    outputDiffLines?: number;
    /**
     * The maximum number of characters allowed in a single object before doing a diff.
     * Vitest tries to stringify an object before doing a diff, but if the object is too large,
     * it will reduce the depth of the object to fit within this limit.
     * Because of this if object is too big or nested, you might not see the diff.
     * @default 10000
     */
    outputDiffMaxSize?: number;
    /**
     * Maximum number of lines in a diff overall.
     * @default 50
     */
    outputDiffMaxLines?: number;
    /**
     * Write test results to a file when the --reporter=json` or `--reporter=junit` option is also specified.
     * Also definable individually per reporter by using an object instead.
     */
    outputFile?: string | (Partial<Record<BuiltinReporters, string>> & Record<string, string>);
    /**
     * Enable multi-threading
     *
     * @default true
     */
    threads?: boolean;
    /**
     * Maximum number of threads
     *
     * @default available CPUs
     */
    maxThreads?: number;
    /**
     * Minimum number of threads
     *
     * @default available CPUs
     */
    minThreads?: number;
    /**
     * Default timeout of a test in milliseconds
     *
     * @default 5000
     */
    testTimeout?: number;
    /**
     * Default timeout of a hook in milliseconds
     *
     * @default 10000
     */
    hookTimeout?: number;
    /**
     * Default timeout to wait for close when Vitest shuts down, in milliseconds
     *
     * @default 1000
     */
    teardownTimeout?: number;
    /**
     * Silent mode
     *
     * @default false
     */
    silent?: boolean;
    /**
     * Path to setup files
     */
    setupFiles?: string | string[];
    /**
     * Path to global setup files
     */
    globalSetup?: string | string[];
    /**
     * Glob pattern of file paths to be ignore from triggering watch rerun
     */
    watchExclude?: string[];
    /**
     * Glob patter of file paths that will trigger the whole suite rerun
     *
     * Useful if you are testing calling CLI commands
     *
     * @default []
     */
    forceRerunTriggers?: string[];
    /**
     * Isolate environment for each test file
     *
     * @default true
     */
    isolate?: boolean;
    /**
     * Coverage options
     */
    coverage?: CoverageOptions;
    /**
     * run test names with the specified pattern
     */
    testNamePattern?: string | RegExp;
    /**
     * Will call `.mockClear()` on all spies before each test
     * @default false
     */
    clearMocks?: boolean;
    /**
     * Will call `.mockReset()` on all spies before each test
     * @default false
     */
    mockReset?: boolean;
    /**
     * Will call `.mockRestore()` on all spies before each test
     * @default false
     */
    restoreMocks?: boolean;
    /**
     * Will restore all global stubs to their original values before each test
     * @default false
     */
    unstubGlobals?: boolean;
    /**
     * Will restore all env stubs to their original values before each test
     * @default false
     */
    unstubEnvs?: boolean;
    /**
     * Serve API options.
     *
     * When set to true, the default port is 51204.
     *
     * @default false
     */
    api?: boolean | number | ApiConfig;
    /**
     * Enable Vitest UI
     * @internal WIP
     */
    ui?: boolean;
    /**
     * Use in browser environment
     * @experimental
     */
    browser?: boolean;
    /**
     * Open UI automatically.
     *
     * @default true
     */
    open?: boolean;
    /**
     * Base url for the UI
     *
     * @default '/__vitest__/'
     */
    uiBase?: string;
    /**
     * Determine the transform method of modules
     */
    transformMode?: {
        /**
         * Use SSR transform pipeline for the specified files.
         * Vite plugins will receive `ssr: true` flag when processing those files.
         *
         * @default [/\.([cm]?[jt]sx?|json)$/]
         */
        ssr?: RegExp[];
        /**
         * First do a normal transform pipeline (targeting browser),
         * then then do a SSR rewrite to run the code in Node.
         * Vite plugins will receive `ssr: false` flag when processing those files.
         *
         * @default other than `ssr`
         */
        web?: RegExp[];
    };
    /**
     * Format options for snapshot testing.
     */
    snapshotFormat?: PrettyFormatOptions;
    /**
     * Resolve custom snapshot path
     */
    resolveSnapshotPath?: (path: string, extension: string) => string;
    /**
     * Pass with no tests
     */
    passWithNoTests?: boolean;
    /**
     * Allow tests and suites that are marked as only
     */
    allowOnly?: boolean;
    /**
     * Show heap usage after each test. Useful for debugging memory leaks.
     */
    logHeapUsage?: boolean;
    /**
     * Custom environment variables assigned to `process.env` before running tests.
     */
    env?: Record<string, string>;
    /**
     * Options for @sinon/fake-timers
     */
    fakeTimers?: FakeTimerInstallOpts;
    /**
     * Custom handler for console.log in tests.
     *
     * Return `false` to ignore the log.
     */
    onConsoleLog?: (log: string, type: 'stdout' | 'stderr') => false | void;
    /**
     * Indicates if CSS files should be processed.
     *
     * When excluded, the CSS files will be replaced with empty strings to bypass the subsequent processing.
     *
     * @default { include: [], modules: { classNameStrategy: false } }
     */
    css?: boolean | {
        include?: RegExp | RegExp[];
        exclude?: RegExp | RegExp[];
        modules?: {
            classNameStrategy?: CSSModuleScopeStrategy;
        };
    };
    /**
     * A number of tests that are allowed to run at the same time marked with `test.concurrent`.
     * @default 5
     */
    maxConcurrency?: number;
    /**
     * Options for configuring cache policy.
     * @default { dir: 'node_modules/.vitest' }
     */
    cache?: false | {
        dir?: string;
    };
    /**
     * Options for configuring the order of running tests.
     */
    sequence?: {
        /**
         * Class that handles sorting and sharding algorithm.
         * If you only need to change sorting, you can extend
         * your custom sequencer from `BaseSequencer` from `vitest/node`.
         * @default BaseSequencer
         */
        sequencer?: TestSequencerConstructor;
        /**
         * Should tests run in random order.
         * @default false
         */
        shuffle?: boolean;
        /**
         * Seed for the random number generator.
         * @default Date.now()
         */
        seed?: number;
        /**
         * Defines how hooks should be ordered
         * - `stack` will order "after" hooks in reverse order, "before" hooks will run sequentially
         * - `list` will order hooks in the order they are defined
         * - `parallel` will run hooks in a single group in parallel
         * @default 'parallel'
         */
        hooks?: SequenceHooks;
    };
    /**
     * Specifies an `Object`, or an `Array` of `Object`,
     * which defines aliases used to replace values in `import` or `require` statements.
     * Will be merged with the default aliases inside `resolve.alias`.
     */
    alias?: AliasOptions;
    /**
     * Ignore any unhandled errors that occur
     */
    dangerouslyIgnoreUnhandledErrors?: boolean;
    /**
     * Options for configuring typechecking test environment.
     */
    typecheck?: Partial<TypecheckConfig>;
    /**
     * The number of milliseconds after which a test is considered slow and reported as such in the results.
     *
     * @default 300
    */
    slowTestThreshold?: number;
}
interface TypecheckConfig {
    /**
     * What tools to use for type checking.
     */
    checker: 'tsc' | 'vue-tsc' | (string & Record<never, never>);
    /**
     * Pattern for files that should be treated as test files
     */
    include: string[];
    /**
     * Pattern for files that should not be treated as test files
     */
    exclude: string[];
    /**
     * Check JS files that have `@ts-check` comment.
     * If you have it enabled in tsconfig, this will not overwrite it.
     */
    allowJs?: boolean;
    /**
     * Do not fail, if Vitest found errors outside the test files.
     */
    ignoreSourceErrors?: boolean;
    /**
     * Path to tsconfig, relative to the project root.
     */
    tsconfig?: string;
}
interface UserConfig extends InlineConfig {
    /**
     * Path to the config file.
     *
     * Default resolving to `vitest.config.*`, `vite.config.*`
     */
    config?: string | undefined;
    /**
     * Use happy-dom
     */
    dom?: boolean;
    /**
     * Run tests that cover a list of source files
     */
    related?: string[] | string;
    /**
     * Overrides Vite mode
     * @default 'test'
     */
    mode?: string;
    /**
     * Runs tests that are affected by the changes in the repository, or between specified branch or commit hash
     * Requires initialized git repository
     * @default false
     */
    changed?: boolean | string;
    /**
     * Test suite shard to execute in a format of <index>/<count>.
     * Will divide tests into a `count` numbers, and run only the `indexed` part.
     * Cannot be used with enabled watch.
     * @example --shard=2/3
     */
    shard?: string;
}
interface ResolvedConfig extends Omit<Required<UserConfig>, 'config' | 'filters' | 'coverage' | 'testNamePattern' | 'related' | 'api' | 'reporters' | 'resolveSnapshotPath' | 'benchmark' | 'shard' | 'cache' | 'sequence' | 'typecheck'> {
    mode: VitestRunMode;
    base?: string;
    config?: string;
    filters?: string[];
    testNamePattern?: RegExp;
    related?: string[];
    coverage: ResolvedCoverageOptions;
    snapshotOptions: SnapshotStateOptions;
    reporters: (Reporter | BuiltinReporters)[];
    defines: Record<string, any>;
    api?: ApiConfig;
    benchmark?: Required<Omit<BenchmarkUserOptions, 'outputFile'>> & {
        outputFile?: BenchmarkUserOptions['outputFile'];
    };
    shard?: {
        index: number;
        count: number;
    };
    cache: {
        dir: string;
    } | false;
    sequence: {
        sequencer: TestSequencerConstructor;
        hooks: SequenceHooks;
        shuffle?: boolean;
        seed?: number;
    };
    typecheck: TypecheckConfig;
}
type RuntimeConfig = Pick<UserConfig, 'allowOnly' | 'testTimeout' | 'hookTimeout' | 'clearMocks' | 'mockReset' | 'restoreMocks' | 'fakeTimers' | 'maxConcurrency'> & {
    sequence?: {
        hooks?: SequenceHooks;
    };
};

type VitestInlineConfig = InlineConfig;
declare module 'vite' {
    interface UserConfig {
        /**
         * Options for Vitest
         */
        test?: VitestInlineConfig;
    }
}

type Formatter = (input: string | number | null | undefined) => string;

interface MatcherHintOptions {
    comment?: string;
    expectedColor?: Formatter;
    isDirectExpectCall?: boolean;
    isNot?: boolean;
    promise?: string;
    receivedColor?: Formatter;
    secondArgument?: string;
    secondArgumentColor?: Formatter;
}
interface DiffOptions {
    aAnnotation?: string;
    aColor?: Formatter;
    aIndicator?: string;
    bAnnotation?: string;
    bColor?: Formatter;
    bIndicator?: string;
    changeColor?: Formatter;
    changeLineTrailingSpaceColor?: Formatter;
    commonColor?: Formatter;
    commonIndicator?: string;
    commonLineTrailingSpaceColor?: Formatter;
    contextLines?: number;
    emptyFirstOrLastLinePlaceholder?: string;
    expand?: boolean;
    includeChangeCounts?: boolean;
    omitAnnotationLines?: boolean;
    patchColor?: Formatter;
    compareKeys?: any;
}

declare const EXPECTED_COLOR: Formatter;
declare const RECEIVED_COLOR: Formatter;
declare const INVERTED_COLOR: Formatter;
declare const BOLD_WEIGHT: Formatter;
declare const DIM_COLOR: Formatter;
declare function matcherHint(matcherName: string, received?: string, expected?: string, options?: MatcherHintOptions): string;
declare function stringify(object: unknown, maxDepth?: number, { maxLength, ...options }?: PrettyFormatOptions & {
    maxLength?: number;
}): string;
declare const printReceived: (object: unknown) => string;
declare const printExpected: (value: unknown) => string;
declare function diff(a: any, b: any, options?: DiffOptions): string;

declare const jestMatcherUtils_EXPECTED_COLOR: typeof EXPECTED_COLOR;
declare const jestMatcherUtils_RECEIVED_COLOR: typeof RECEIVED_COLOR;
declare const jestMatcherUtils_INVERTED_COLOR: typeof INVERTED_COLOR;
declare const jestMatcherUtils_BOLD_WEIGHT: typeof BOLD_WEIGHT;
declare const jestMatcherUtils_DIM_COLOR: typeof DIM_COLOR;
declare const jestMatcherUtils_matcherHint: typeof matcherHint;
declare const jestMatcherUtils_stringify: typeof stringify;
declare const jestMatcherUtils_printReceived: typeof printReceived;
declare const jestMatcherUtils_printExpected: typeof printExpected;
declare const jestMatcherUtils_diff: typeof diff;
declare namespace jestMatcherUtils {
  export {
    jestMatcherUtils_EXPECTED_COLOR as EXPECTED_COLOR,
    jestMatcherUtils_RECEIVED_COLOR as RECEIVED_COLOR,
    jestMatcherUtils_INVERTED_COLOR as INVERTED_COLOR,
    jestMatcherUtils_BOLD_WEIGHT as BOLD_WEIGHT,
    jestMatcherUtils_DIM_COLOR as DIM_COLOR,
    jestMatcherUtils_matcherHint as matcherHint,
    jestMatcherUtils_stringify as stringify,
    jestMatcherUtils_printReceived as printReceived,
    jestMatcherUtils_printExpected as printExpected,
    jestMatcherUtils_diff as diff,
  };
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface SnapshotReturnOptions {
    actual: string;
    count: number;
    expected?: string;
    key: string;
    pass: boolean;
}
interface SaveStatus {
    deleted: boolean;
    saved: boolean;
}
declare class SnapshotState {
    testFilePath: string;
    snapshotPath: string;
    private _counters;
    private _dirty;
    private _updateSnapshot;
    private _snapshotData;
    private _initialData;
    private _inlineSnapshots;
    private _uncheckedKeys;
    private _snapshotFormat;
    added: number;
    expand: boolean;
    matched: number;
    unmatched: number;
    updated: number;
    constructor(testFilePath: string, snapshotPath: string, options: SnapshotStateOptions);
    markSnapshotsAsCheckedForTest(testName: string): void;
    private _inferInlineSnapshotStack;
    private _addSnapshot;
    clear(): void;
    save(): Promise<SaveStatus>;
    getUncheckedCount(): number;
    getUncheckedKeys(): Array<string>;
    removeUncheckedKeys(): void;
    match({ testName, received, key, inlineSnapshot, isInline, error, }: SnapshotMatchOptions): SnapshotReturnOptions;
    pack(): Promise<SnapshotResult>;
}

type Tester = (a: any, b: any) => boolean | undefined;
interface MatcherState {
    assertionCalls: number;
    currentTestName?: string;
    dontThrow?: () => void;
    error?: Error;
    equals: (a: unknown, b: unknown, customTesters?: Array<Tester>, strictCheck?: boolean) => boolean;
    expand?: boolean;
    expectedAssertionsNumber?: number | null;
    expectedAssertionsNumberErrorGen?: (() => Error) | null;
    isExpectingAssertions?: boolean;
    isExpectingAssertionsError?: Error | null;
    isNot: boolean;
    environment: VitestEnvironment;
    promise: string;
    snapshotState: SnapshotState;
    suppressedErrors: Array<Error>;
    testPath?: string;
    utils: typeof jestMatcherUtils & {
        iterableEquality: Tester;
        subsetEquality: Tester;
    };
}
interface SyncExpectationResult {
    pass: boolean;
    message: () => string;
    actual?: any;
    expected?: any;
}
type AsyncExpectationResult = Promise<SyncExpectationResult>;
type ExpectationResult = SyncExpectationResult | AsyncExpectationResult;
interface RawMatcherFn<T extends MatcherState = MatcherState> {
    (this: T, received: any, expected: any, options?: any): ExpectationResult;
}
type MatchersObject<T extends MatcherState = MatcherState> = Record<string, RawMatcherFn<T>>;

type Promisify<O> = {
    [K in keyof O]: O[K] extends (...args: infer A) => infer R ? O extends R ? Promisify<O[K]> : (...args: A) => Promise<R> : O[K];
};
declare global {
    namespace jest {
        interface Matchers<R, T = {}> {
        }
    }
    namespace Vi {
        interface ExpectStatic extends Chai.ExpectStatic, AsymmetricMatchersContaining {
            <T>(actual: T, message?: string): Vi.Assertion<T>;
            extend(expects: MatchersObject): void;
            assertions(expected: number): void;
            hasAssertions(): void;
            anything(): any;
            any(constructor: unknown): any;
            addSnapshotSerializer(plugin: Plugin): void;
            getState(): MatcherState;
            setState(state: Partial<MatcherState>): void;
            not: AsymmetricMatchersContaining;
        }
        interface AsymmetricMatchersContaining {
            stringContaining(expected: string): any;
            objectContaining(expected: any): any;
            arrayContaining<T = unknown>(expected: Array<T>): any;
            stringMatching(expected: string | RegExp): any;
        }
        interface JestAssertion<T = any> extends jest.Matchers<void, T> {
            toMatchSnapshot<U extends {
                [P in keyof T]: any;
            }>(snapshot: Partial<U>, message?: string): void;
            toMatchSnapshot(message?: string): void;
            matchSnapshot<U extends {
                [P in keyof T]: any;
            }>(snapshot: Partial<U>, message?: string): void;
            matchSnapshot(message?: string): void;
            toMatchInlineSnapshot<U extends {
                [P in keyof T]: any;
            }>(properties: Partial<U>, snapshot?: string, message?: string): void;
            toMatchInlineSnapshot(snapshot?: string, message?: string): void;
            toThrowErrorMatchingSnapshot(message?: string): void;
            toThrowErrorMatchingInlineSnapshot(snapshot?: string, message?: string): void;
            toEqual<E>(expected: E): void;
            toStrictEqual<E>(expected: E): void;
            toBe<E>(expected: E): void;
            toMatch(expected: string | RegExp): void;
            toMatchObject<E extends {} | any[]>(expected: E): void;
            toContain<E>(item: E): void;
            toContainEqual<E>(item: E): void;
            toBeTruthy(): void;
            toBeFalsy(): void;
            toBeGreaterThan(num: number | bigint): void;
            toBeGreaterThanOrEqual(num: number | bigint): void;
            toBeLessThan(num: number | bigint): void;
            toBeLessThanOrEqual(num: number | bigint): void;
            toBeNaN(): void;
            toBeUndefined(): void;
            toBeNull(): void;
            toBeDefined(): void;
            toBeTypeOf(expected: 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined'): void;
            toBeInstanceOf<E>(expected: E): void;
            toBeCalledTimes(times: number): void;
            toHaveLength(length: number): void;
            toHaveProperty<E>(property: string | string[], value?: E): void;
            toBeCloseTo(number: number, numDigits?: number): void;
            toHaveBeenCalledTimes(times: number): void;
            toHaveBeenCalledOnce(): void;
            toHaveBeenCalled(): void;
            toBeCalled(): void;
            toHaveBeenCalledWith<E extends any[]>(...args: E): void;
            toBeCalledWith<E extends any[]>(...args: E): void;
            toHaveBeenNthCalledWith<E extends any[]>(n: number, ...args: E): void;
            nthCalledWith<E extends any[]>(nthCall: number, ...args: E): void;
            toHaveBeenLastCalledWith<E extends any[]>(...args: E): void;
            lastCalledWith<E extends any[]>(...args: E): void;
            toThrow(expected?: string | Constructable | RegExp | Error): void;
            toThrowError(expected?: string | Constructable | RegExp | Error): void;
            toReturn(): void;
            toHaveReturned(): void;
            toReturnTimes(times: number): void;
            toHaveReturnedTimes(times: number): void;
            toReturnWith<E>(value: E): void;
            toHaveReturnedWith<E>(value: E): void;
            toHaveLastReturnedWith<E>(value: E): void;
            lastReturnedWith<E>(value: E): void;
            toHaveNthReturnedWith<E>(nthCall: number, value: E): void;
            nthReturnedWith<E>(nthCall: number, value: E): void;
            toSatisfy<E>(matcher: (value: E) => boolean, message?: string): void;
        }
        type VitestAssertion<A, T> = {
            [K in keyof A]: A[K] extends Chai.Assertion ? Assertion<T> : A[K] extends (...args: any[]) => any ? A[K] : VitestAssertion<A[K], T>;
        } & ((type: string, message?: string) => Assertion);
        interface Assertion<T = any> extends VitestAssertion<Chai.Assertion, T>, JestAssertion<T> {
            resolves: Promisify<Assertion<T>>;
            rejects: Promisify<Assertion<T>>;
        }
    }
}

type RawErrsMap = Map<string, TscErrorInfo[]>;
interface TscErrorInfo {
    filePath: string;
    errCode: number;
    errMsg: string;
    line: number;
    column: number;
}
interface CollectLineNumbers {
    target: number;
    next: number;
    prev?: number;
}
type CollectLines = {
    [key in keyof CollectLineNumbers]: string;
};
interface RootAndTarget {
    root: string;
    targetAbsPath: string;
}
type Context = RootAndTarget & {
    rawErrsMap: RawErrsMap;
    openedDirs: Set<string>;
    lastActivePath?: string;
};

export { WorkerContext as $, ApiConfig as A, BuiltinEnvironment as B, CollectLineNumbers as C, DoneCallback as D, EnvironmentOptions as E, FakeTimerInstallOpts as F, SuiteFactory as G, HookListener as H, InlineConfig as I, JSDOMOptions as J, RuntimeContext as K, TestContext as L, ModuleGraphData as M, Vitest as N, OnTestFailedHandler as O, SnapshotData as P, SnapshotUpdateState as Q, RuntimeConfig as R, SequenceHooks as S, TaskResultPack as T, UserConfig as U, VitestEnvironment as V, SnapshotStateOptions as W, SnapshotMatchOptions as X, SnapshotResult as Y, UncheckedSnapshot as Z, SnapshotSummary as _, File as a, ResolveIdFunction as a0, AfterSuiteRunMeta as a1, WorkerRPC as a2, WorkerGlobalState as a3, Awaitable as a4, Nullable as a5, Arrayable as a6, ArgumentsType$1 as a7, MergeInsertions as a8, DeepMerge as a9, TestSequencerConstructor as aA, MutableArray as aa, Constructable as ab, ModuleCache as ac, EnvironmentReturn as ad, Environment as ae, UserConsoleLog as af, Position as ag, ParsedStack as ah, ErrorWithDiff as ai, OnServerRestartHandler as aj, CoverageProvider as ak, CoverageProviderModule as al, CoverageReporter as am, CoverageOptions as an, ResolvedCoverageOptions as ao, BaseCoverageOptions as ap, CoverageIstanbulOptions as aq, CoverageC8Options as ar, BenchmarkUserOptions as as, Benchmark as at, BenchmarkResult as au, BenchFunction as av, BenchmarkAPI as aw, MockMap as ax, TestSequencer as ay, startVitest as az, ResolvedConfig as b, Reporter as c, RawErrsMap as d, TscErrorInfo as e, CollectLines as f, RootAndTarget as g, Context as h, CSSModuleScopeStrategy as i, VitestRunMode as j, TypecheckConfig as k, RunMode as l, TaskState as m, TaskBase as n, TaskResult as o, Suite as p, Test as q, TypeCheck as r, Task as s, TestFunction as t, TestOptions as u, TestAPI as v, SuiteAPI as w, HookCleanupCallback as x, SuiteHooks as y, SuiteCollector as z };
