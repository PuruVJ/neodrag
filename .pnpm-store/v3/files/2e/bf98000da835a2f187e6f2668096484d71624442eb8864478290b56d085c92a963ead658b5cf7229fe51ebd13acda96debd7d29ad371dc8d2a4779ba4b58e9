import { s as spyOn, f as fn, M as MaybeMockedDeep, a as MaybeMocked, b as MaybePartiallyMocked, c as MaybePartiallyMockedDeep, E as EnhancedSpy } from './index-40ebba2b.js';
export { A as AssertType, E as EnhancedSpy, q as ExpectTypeOf, x as Mock, y as MockContext, w as MockInstance, z as Mocked, B as MockedClass, u as MockedFunction, v as MockedObject, S as SpyInstance, j as afterAll, l as afterEach, r as assertType, h as beforeAll, k as beforeEach, g as bench, n as createExpect, e as describe, m as expect, p as expectTypeOf, i as it, o as onTestFailed, d as suite, t as test } from './index-40ebba2b.js';
import { D as DoneCallback, F as FakeTimerInstallOpts, R as RuntimeConfig, a as File, T as TaskResultPack, b as ResolvedConfig, M as ModuleGraphData, c as Reporter } from './types-2a26f28c.js';
export { a1 as AfterSuiteRunMeta, A as ApiConfig, a7 as ArgumentsType, a6 as Arrayable, a4 as Awaitable, ap as BaseCoverageOptions, av as BenchFunction, at as Benchmark, aw as BenchmarkAPI, au as BenchmarkResult, as as BenchmarkUserOptions, B as BuiltinEnvironment, i as CSSModuleScopeStrategy, C as CollectLineNumbers, f as CollectLines, ab as Constructable, h as Context, ar as CoverageC8Options, aq as CoverageIstanbulOptions, an as CoverageOptions, ak as CoverageProvider, al as CoverageProviderModule, am as CoverageReporter, a9 as DeepMerge, D as DoneCallback, ae as Environment, E as EnvironmentOptions, ad as EnvironmentReturn, ai as ErrorWithDiff, a as File, x as HookCleanupCallback, H as HookListener, I as InlineConfig, J as JSDOMOptions, a8 as MergeInsertions, ac as ModuleCache, M as ModuleGraphData, aa as MutableArray, a5 as Nullable, aj as OnServerRestartHandler, O as OnTestFailedHandler, ah as ParsedStack, ag as Position, d as RawErrsMap, c as Reporter, a0 as ResolveIdFunction, b as ResolvedConfig, ao as ResolvedCoverageOptions, g as RootAndTarget, l as RunMode, R as RuntimeConfig, K as RuntimeContext, S as SequenceHooks, P as SnapshotData, X as SnapshotMatchOptions, Y as SnapshotResult, W as SnapshotStateOptions, _ as SnapshotSummary, Q as SnapshotUpdateState, p as Suite, w as SuiteAPI, z as SuiteCollector, G as SuiteFactory, y as SuiteHooks, s as Task, n as TaskBase, o as TaskResult, T as TaskResultPack, m as TaskState, q as Test, v as TestAPI, L as TestContext, t as TestFunction, u as TestOptions, e as TscErrorInfo, r as TypeCheck, k as TypecheckConfig, Z as UncheckedSnapshot, U as UserConfig, af as UserConsoleLog, N as Vitest, V as VitestEnvironment, j as VitestRunMode, $ as WorkerContext, a3 as WorkerGlobalState, a2 as WorkerRPC } from './types-2a26f28c.js';
import { TransformResult } from 'vite';
import * as chai from 'chai';
export { chai };
export { assert, should } from 'chai';
export { Bench as BenchFactory, Options as BenchOptions, Task as BenchTask, TaskResult as BenchTaskResult } from 'tinybench';
import 'tinyspy';
import 'vite-node/client';
import 'vite-node/server';
import 'vite-node';
import 'node:fs';
import 'node:worker_threads';

/**
 * A simple wrapper for converting callback style to promise
 */
declare function withCallback(fn: (done: DoneCallback) => void): Promise<void>;

/**
 * This utils allows computational intensive tasks to only be ran once
 * across test reruns to improve the watch mode performance.
 *
 * Currently only works with `isolate: false`
 *
 * @experimental
 */
declare function runOnce<T>(fn: (() => T), key?: string): T;
/**
 * Get a boolean indicates whether the task is running in the first time.
 * Could only be `false` in watch mode.
 *
 * Currently only works with `isolate: false`
 *
 * @experimental
 */
declare function isFirstRun(): boolean;

declare class VitestUtils {
    private _timers;
    private _mockedDate;
    private _mocker;
    constructor();
    useFakeTimers(config?: FakeTimerInstallOpts): this;
    useRealTimers(): this;
    runOnlyPendingTimers(): this;
    runAllTimers(): this;
    runAllTicks(): this;
    advanceTimersByTime(ms: number): this;
    advanceTimersToNextTimer(): this;
    getTimerCount(): number;
    setSystemTime(time: number | string | Date): this;
    getMockedSystemTime(): string | number | Date | null;
    getRealSystemTime(): number;
    clearAllTimers(): this;
    spyOn: typeof spyOn;
    fn: typeof fn;
    private getImporter;
    /**
     * Makes all `imports` to passed module to be mocked.
     * - If there is a factory, will return it's result. The call to `vi.mock` is hoisted to the top of the file,
     * so you don't have access to variables declared in the global file scope, if you didn't put them before imports!
     * - If `__mocks__` folder with file of the same name exist, all imports will
     * return it.
     * - If there is no `__mocks__` folder or a file with the same name inside, will call original
     * module and mock it.
     * @param path Path to the module. Can be aliased, if your config supports it
     * @param factory Factory for the mocked module. Has the highest priority.
     */
    mock(path: string, factory?: () => any): void;
    /**
     * Removes module from mocked registry. All subsequent calls to import will
     * return original module even if it was mocked.
     * @param path Path to the module. Can be aliased, if your config supports it
     */
    unmock(path: string): void;
    doMock(path: string, factory?: () => any): void;
    doUnmock(path: string): void;
    /**
     * Imports module, bypassing all checks if it should be mocked.
     * Can be useful if you want to mock module partially.
     * @example
     * vi.mock('./example', async () => {
     *  const axios = await vi.importActual('./example')
     *
     *  return { ...axios, get: vi.fn() }
     * })
     * @param path Path to the module. Can be aliased, if your config supports it
     * @returns Actual module without spies
     */
    importActual<T>(path: string): Promise<T>;
    /**
     * Imports a module with all of its properties and nested properties mocked.
     * For the rules applied, see docs.
     * @param path Path to the module. Can be aliased, if your config supports it
     * @returns Fully mocked module
     */
    importMock<T>(path: string): Promise<MaybeMockedDeep<T>>;
    /**
     * Type helpers for TypeScript. In reality just returns the object that was passed.
     *
     * When `partial` is `true` it will expect a `Partial<T>` as a return value.
     * @example
     * import example from './example'
     * vi.mock('./example')
     *
     * test('1+1 equals 2' async () => {
     *  vi.mocked(example.calc).mockRestore()
     *
     *  const res = example.calc(1, '+', 1)
     *
     *  expect(res).toBe(2)
     * })
     * @param item Anything that can be mocked
     * @param deep If the object is deeply mocked
     * @param options If the object is partially or deeply mocked
     */
    mocked<T>(item: T, deep?: false): MaybeMocked<T>;
    mocked<T>(item: T, deep: true): MaybeMockedDeep<T>;
    mocked<T>(item: T, options: {
        partial?: false;
        deep?: false;
    }): MaybeMocked<T>;
    mocked<T>(item: T, options: {
        partial?: false;
        deep: true;
    }): MaybeMockedDeep<T>;
    mocked<T>(item: T, options: {
        partial: true;
        deep?: false;
    }): MaybePartiallyMocked<T>;
    mocked<T>(item: T, options: {
        partial: true;
        deep: true;
    }): MaybePartiallyMockedDeep<T>;
    isMockFunction(fn: any): fn is EnhancedSpy;
    clearAllMocks(): this;
    resetAllMocks(): this;
    restoreAllMocks(): this;
    private _stubsGlobal;
    private _stubsEnv;
    /**
     * Makes value available on global namespace.
     * Useful, if you want to have global variables available, like `IntersectionObserver`.
     * You can return it back to original value with `vi.unstubGlobals`, or by enabling `unstubGlobals` config option.
     */
    stubGlobal(name: string | symbol | number, value: any): this;
    /**
     * Changes the value of `import.meta.env` and `process.env`.
     * You can return it back to original value with `vi.unstubEnvs`, or by enabling `unstubEnvs` config option.
     */
    stubEnv(name: string, value: string): this;
    /**
     * Reset the value to original value that was available before first `vi.stubGlobal` was called.
     */
    unstubAllGlobals(): this;
    /**
     * Reset enviromental variables to the ones that were available before first `vi.stubEnv` was called.
     */
    unstubAllEnvs(): this;
    resetModules(): this;
    /**
     * Wait for all imports to load. Useful, if you have a synchronous call that starts
     * importing a module that you cannot await otherwise.
     * Will also wait for new imports, started during the wait.
     */
    dynamicImportSettled(): Promise<void>;
    private _config;
    /**
     * Updates runtime config. You can only change values that are used when executing tests.
     */
    setConfig(config: RuntimeConfig): void;
    /**
     * If config was changed with `vi.setConfig`, this will reset it to the original state.
     */
    resetConfig(): void;
}
declare const vitest: VitestUtils;
declare const vi: VitestUtils;

declare function getRunningMode(): "run" | "watch";
declare function isWatchMode(): boolean;

interface TransformResultWithSource extends TransformResult {
    source?: string;
}
interface WebSocketHandlers {
    onWatcherStart: () => Promise<void>;
    onFinished(files?: File[]): Promise<void>;
    onCollected(files?: File[]): Promise<void>;
    onTaskUpdate(packs: TaskResultPack[]): void;
    getFiles(): File[];
    getPaths(): Promise<string[]>;
    getConfig(): ResolvedConfig;
    getModuleGraph(id: string): Promise<ModuleGraphData>;
    getTransformResult(id: string): Promise<TransformResultWithSource | undefined>;
    readFile(id: string): Promise<string>;
    writeFile(id: string, content: string): Promise<void>;
    rerun(files: string[]): Promise<void>;
    updateSnapshot(file?: File): Promise<void>;
}
interface WebSocketEvents extends Pick<Reporter, 'onCollected' | 'onFinished' | 'onTaskUpdate' | 'onUserConsoleLog' | 'onPathsCollected'> {
}

export { TransformResultWithSource, WebSocketEvents, WebSocketHandlers, getRunningMode, isFirstRun, isWatchMode, runOnce, vi, vitest, withCallback };
