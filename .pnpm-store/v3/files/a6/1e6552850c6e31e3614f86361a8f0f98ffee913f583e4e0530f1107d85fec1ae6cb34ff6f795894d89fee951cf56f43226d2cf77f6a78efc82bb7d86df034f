import { TsConfigJson } from 'type-fest';
/** The default search name used. */
export declare const DEFAULT_SEARCH_NAME = "tsconfig.json";
/**
 * The reason that the tsconfig exist flag is false.
 */
export declare const TsConfigErrorReason: {
    /**
     * The `tsconfig` file could not be found.
     */
    readonly NotFound: "not-found";
    /**
     * The file was found but the configuration was invalid.
     */
    readonly InvalidConfig: "invalid-config";
};
interface TsConfigFailure {
    /**
     * Whether or not the configuration could be loaded.
     *
     * - `false` when no tsconfig could be found.
     */
    exists: false;
    /**
     * The configuration object.
     *
     * - `undefined` when the tsconfig resolver failed and no configuration was
     *   found.
     */
    config?: undefined;
    /**
     * The extendedPaths array.
     *
     * - `undefined` when the tsconfig resolver failed to load a valid
     *   configuration.
     */
    extendedPaths?: undefined;
    /**
     * The `isCircular` config flag.
     *
     * - `undefined` when the tsconfig resolver failed to load a valid
     *   configuration.
     */
    isCircular?: undefined;
}
export interface TsConfigFailureNotFound extends TsConfigFailure {
    /**
     * The reason for failure.
     *
     * - `TsConfigErrorReason.NotFound` when the config failure is because the
     *   filename has not been found.
     */
    reason: typeof TsConfigErrorReason.NotFound;
    /**
     * The absolute path to the `tsconfig.json` or given filename.
     *
     * - `undefined` when not found.
     */
    path?: undefined;
}
export interface TsConfigFailureInvalidConfig extends TsConfigFailure {
    /**
     * - `TsConfigErrorReason.InvalidConfig` when the config failure is because of
     *   an invalid config.
     */
    reason: typeof TsConfigErrorReason.InvalidConfig;
    /**
     * - `string` when config json is invalid.
     */
    path: string;
}
export interface TsConfigResultSuccess {
    /**
     * - `true` when a valid tsconfig file has been found and successfully loaded.
     */
    exists: true;
    /**
     * - `string` when a valid tsconfig has been loaded.
     */
    path: string;
    /**
     * - `string[]` of absolute paths to resolved tsconfig files when extended
     *   paths are encountered.
     * - `[]` an empty array when no extended paths were encountered.
     * - `[]` an empty array when `ignoreExtends` options is set to true.
     */
    extendedPaths: string[];
    /**
     * - `true` when a circular `extends` property was encountered (an extends
     *   path chain that references itself).
     * - `false` when no circular `extends` property was encountered.
     */
    isCircular: boolean;
    /**
     * - `TsConfigJson` when the resolved tsconfig has been found and loaded.
     */
    config: TsConfigJson;
    /**
     * - `undefined` when no failure has occurred.
     */
    reason?: undefined;
}
/**
 * The result of loading the tsconfig. If the exists property is `true` then
 * there will be a path and config property available.
 */
export declare type TsConfigResult = TsConfigFailureNotFound | TsConfigFailureInvalidConfig | TsConfigResultSuccess;
export interface TsConfigLoaderParams {
    getEnv: (key: string) => string | undefined;
    cwd: string;
    loadSync?(cwd: string, searchName?: string): TsConfigResult;
}
export interface TsConfigResolverOptions {
    /**
     * The absolute directory to start resolving from.
     *
     * @default `process.cwd()`
     */
    cwd?: string;
    /**
     * The tsconfig file name to search for. This is where the `TsConfigJson`
     * configuration object will be loaded from.
     *
     * @default 'tsconfig.json'
     */
    searchName?: string;
    /**
     * A direct path to the tsconfig file you would like to load. The path will be
     * relative to `cwd`. If it leads to a directory then the `searchName` will be
     * appended.
     *
     * This also supports the `npm:` prefix which will find the given npm package
     * directory, if it is installed.
     *
     * @default undefined
     */
    filePath?: string | undefined;
    /**
     * The caching strategy to use. `'never'` or `'always'` or `'directory'` or
     * `true` or `false`.
     *
     * `true` is the same as `'always'`
     * `false` is the same as `'never'`
     *
     * @default 'never'
     *
     * @remarks
     *
     * Sometimes you'll want to run this module several times during runtime but
     * it can be slow and expensive walk up the file tree for the tsconfig value
     * every time.
     *
     * To help prevent unnecessary lookups there are custom caching strategies
     * available. See {@link CacheStrategy}.
     */
    cache?: CacheStrategyType | boolean;
    /**
     * When true will not automatically populate the `extends` argument. This is
     * useful if all you want is the json object and not the fully resolved
     * configuration.
     *
     * @default false
     */
    ignoreExtends?: boolean;
}
export declare const CacheStrategy: {
    /**
     * Caching never happens and the returned value is always recalculated.
     */
    readonly Never: "never";
    /**
     * The first time the `tsconfigResolver` method is run it will save a cached
     * value (by `searchName`) which will be returned every time after that. This
     * value will always be the same.
     */
    readonly Always: "always";
    /**
     * The cache will be used when the same directory (and searchName) is being
     * searched.
     */
    readonly Directory: "directory";
};
/**
 * The available cache strategies as a union of strings.
 */
export declare type CacheStrategyType = typeof CacheStrategy[keyof typeof CacheStrategy];
/**
 * Clears the cache.
 */
export declare const clearCache: () => void;
export { TsConfigJson };
/**
 * Resolve the `tsconfig` file synchronously. Walks up the file tree until it
 * finds a file that matches the searchName.
 *
 * @param options - `TsConfigResolverOptions`.
 *
 * @returns an object containing whether a configuration was found and is valid.
 *
 * @remarks
 *
 * If a non-default caching strategy is provided the returned result might be
 * from the cache instead.
 */
export declare function tsconfigResolverSync({ filePath, cwd, cache: shouldCache, searchName, ignoreExtends, }?: TsConfigResolverOptions): TsConfigResult;
/**
 * Resolve the `tsconfig` file. Walks up the file tree until it
 * finds a file that matches the searchName.
 *
 * @param options - `TsConfigResolverOptions`.
 *
 * @remarks
 *
 * If a non-default caching strategy is provided the returned result might be
 * from the cache instead.
 */
export declare function tsconfigResolver({ filePath, cwd, cache: shouldCache, searchName, ignoreExtends, }?: TsConfigResolverOptions): Promise<TsConfigResult>;
//# sourceMappingURL=index.d.ts.map