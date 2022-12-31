import { promises, readFileSync, statSync } from 'fs';
import {
  ParsedPath,
  dirname,
  join,
  parse as pathParse,
  win32 as pathWin32,
  resolve,
} from 'path';

import JSON5 from 'json5';
import resolvePackageNpm from 'resolve';
import StripBom from 'strip-bom';
import { Except, SetOptional, TsConfigJson } from 'type-fest';

const { readFile, stat } = promises;

/** The default search name used. */
export const DEFAULT_SEARCH_NAME = 'tsconfig.json';

interface IsNodeModuleRequireOptions {
  /**
   * Whether to simulate windows.
   *
   * @default undefined
   */
  windows?: boolean;
}

interface ParseFilePath {
  /**
   * True when the file path provided is an absolute path.
   */
  isAbsolute: boolean;

  /**
   * True when the file path potentially refers to a node module package.
   */
  isPackage: boolean;
}

/**
 * Extends the default node file parser and determines whether the path provided
 * should be resolved from the node modules or directly from the provided path.
 */
const parseFilePath = (
  file: string,
  { windows }: IsNodeModuleRequireOptions = {},
): ParsedPath & ParseFilePath => {
  const isWindows = windows ?? process.platform === 'win32';
  const parser = isWindows ? pathWin32.parse : pathParse;
  const parsedPath = parser(file);

  return {
    ...parsedPath,
    isAbsolute: Boolean(parsedPath.root),
    isPackage: !file.startsWith('.') && !parsedPath.root,
  };
};

/**
 * The reason that the tsconfig exist flag is false.
 */
export const TsConfigErrorReason = {
  /**
   * The `tsconfig` file could not be found.
   */
  NotFound: 'not-found',

  /**
   * The file was found but the configuration was invalid.
   */
  InvalidConfig: 'invalid-config',
} as const;

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
export type TsConfigResult =
  | TsConfigFailureNotFound
  | TsConfigFailureInvalidConfig
  | TsConfigResultSuccess;

export interface TsConfigLoaderParams {
  getEnv: (key: string) => string | undefined;
  cwd: string;
  loadSync?(cwd: string, searchName?: string): TsConfigResult;
}

/**
 * Synchronously walk up the path until a `tsconfig` is located.
 */
const walkForTsConfigSync = (directory: string): string | undefined => {
  const configPath = join(directory, './tsconfig.json');
  if (isFileOrDirectorySync(configPath)) {
    return configPath;
  }

  const parentDirectory = join(directory, '../');

  // If we reached the top
  if (directory === parentDirectory) {
    return undefined;
  }

  return walkForTsConfigSync(parentDirectory);
};

/**
 * Walk up the path until a `tsconfig` is located.
 */
const walkForTsConfig = async (
  directory: string,
): Promise<string | undefined> => {
  const configPath = join(directory, './tsconfig.json');
  if (await isFileOrDirectory(configPath)) {
    return configPath;
  }

  // Step up one level in the directory path.
  const parentDirectory = join(directory, '../');

  // If we reached the top
  if (directory === parentDirectory) {
    return undefined;
  }

  return walkForTsConfig(parentDirectory);
};

/**
 * Synchronously check that the passed string is a directory.
 */
const isDirectorySync = (directory: string) => {
  try {
    return statSync(directory).isDirectory();
  } catch {
    return false;
  }
};

/**
 * Check that the passed string is a directory.
 */
const isDirectory = async (directory: string) => {
  try {
    const stats = await stat(directory);
    return stats.isDirectory();
  } catch {
    return false;
  }
};

/**
 * Synchronously check that the passed filePath is a valid file.
 */
const isFileSync = (filePath: string) => {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
};

/**
 * Check that the passed filePath is a valid file.
 */
const isFile = async (filePath: string) => {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
};

/**
 * Synchronously check that the provided `filePath` is a file or directory.
 */
const isFileOrDirectorySync = (filePath: string) =>
  isFileSync(filePath) || isDirectorySync(filePath);

/**
 * Check that the provided `filePath` is a file or directory.
 */
const isFileOrDirectory = async (filePath: string) => {
  if (await isFile(filePath)) {
    return true;
  }

  if (await isDirectory(filePath)) {
    return true;
  }

  return false;
};

/**
 * Synchronously resolves an npm package by the given name.
 */
const resolvePackageSync = (name: string, basedir?: string) => {
  try {
    return resolvePackageNpm.sync(name, {
      basedir,
      extensions: ['.json', '.js'],
    });
  } catch {
    return;
  }
};

/**
 * Resolves an npm package by the given name.
 */
const resolvePackage = (name: string, basedir?: string) => {
  return new Promise<string | undefined>((resolve, reject) => {
    resolvePackageNpm(
      name,
      {
        basedir,
        extensions: ['.json', '.js'],
      },
      (error, resolved) => {
        if (error) {
          reject(error);
        } else {
          resolve(resolved);
        }
      },
    );
  });
};

/**
 * Synchronously checks a filePath exists and if it can be resolved.
 */
const resolveFilePathSync = (
  searchName: string,
  filePath?: string,
): string | undefined => {
  const cwd = process.cwd();
  if (!filePath) {
    return;
  }

  let resolvedPath: string | undefined;

  if (filePath.startsWith('npm:')) {
    resolvedPath = resolvePackageSync(filePath.replace('npm:', ''), cwd);
  } else {
    resolvedPath = resolve(cwd, filePath);
  }

  if (!resolvedPath || !isDirectorySync(resolvedPath)) {
    return resolvedPath;
  }

  return resolve(resolvedPath, searchName);
};

/**
 * When a filePath exists check if it can be resolved.
 */
const resolveFilePath = async (
  searchName: string,
  filePath?: string,
): Promise<string | undefined> => {
  const cwd = process.cwd();
  if (!filePath) {
    return;
  }

  let resolvedPath: string | undefined;

  if (filePath.startsWith('npm:')) {
    resolvedPath = await resolvePackage(filePath.replace('npm:', ''), cwd);
  } else {
    resolvedPath = resolve(cwd, filePath);
  }

  if (!resolvedPath || !(await isDirectory(resolvedPath))) {
    return resolvedPath;
  }

  return resolve(resolvedPath, searchName);
};

/**
 * Get the desired path to the configuration.
 */
const resolveConfigPathSync = (
  cwd: string,
  searchName: string,
  filePath?: string,
): string | undefined => {
  const resolvedFilePath = resolveFilePathSync(searchName, filePath);
  if (resolvedFilePath) {
    return resolvedFilePath;
  }

  if (searchName !== DEFAULT_SEARCH_NAME) {
    const resolvedSearchName = resolve(cwd, searchName);
    const absolutePath = isDirectorySync(resolvedSearchName)
      ? resolve(resolvedSearchName, 'tsconfig.json')
      : resolvedSearchName;

    return isFileSync(absolutePath) ? absolutePath : undefined;
  }

  if (isFileSync(cwd)) {
    return resolve(cwd);
  }

  const configAbsolutePath = walkForTsConfigSync(cwd);
  return configAbsolutePath ? resolve(configAbsolutePath) : undefined;
};

/**
 * Get the desired path to the configuration.
 */
const resolveConfigPath = async (
  cwd: string,
  searchName: string,
  filePath?: string,
): Promise<string | undefined> => {
  const resolvedFilePath = await resolveFilePath(searchName, filePath);

  if (resolvedFilePath) {
    return resolvedFilePath;
  }

  if (searchName !== DEFAULT_SEARCH_NAME) {
    const resolvedSearchName = resolve(cwd, searchName);
    const absolutePath = (await isDirectory(resolvedSearchName))
      ? resolve(resolvedSearchName, 'tsconfig.json')
      : resolvedSearchName;

    return (await isFile(absolutePath)) ? absolutePath : undefined;
  }

  if (await isFile(cwd)) {
    return resolve(cwd);
  }

  const configAbsolutePath = await walkForTsConfig(cwd);
  return configAbsolutePath ? resolve(configAbsolutePath) : undefined;
};

/**
 * Loads the `jsonString` and returns it as a TsConfigJson object.
 */
const parseTsConfigJson = (jsonString: string): TsConfigJson | undefined => {
  try {
    const json = JSON5.parse(jsonString);
    return json && typeof json === 'object' ? json : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Synchronously loads a tsconfig file while also resolving the `extends` path.
 */
const loadTsConfigSync = (
  configFilePath: string,
  extendedPaths: string[],
  ignoreExtends = false,
): TsConfigJson | undefined => {
  if (!isFileOrDirectorySync(configFilePath)) return undefined;

  const configString = readFileSync(configFilePath, 'utf8');
  const jsonString = StripBom(configString);
  const config = parseTsConfigJson(jsonString);
  let extendedConfig = config?.extends;

  if (!config || !extendedConfig || ignoreExtends) return config;

  let base: TsConfigJson;

  if (parseFilePath(extendedConfig).isPackage) {
    const newConfigPath = resolvePackageSync(extendedConfig);

    if (!newConfigPath) {
      return config;
    } else if (isDirectorySync(newConfigPath)) {
      extendedConfig = join(newConfigPath, DEFAULT_SEARCH_NAME);
    } else if (isFileSync(newConfigPath)) {
      extendedConfig = newConfigPath;
    } else if (isFileSync(`${newConfigPath}.json`)) {
      extendedConfig = `${newConfigPath}.json`;
    }

    if (extendedPaths.includes(extendedConfig)) {
      return config;
    }

    extendedPaths.push(extendedConfig);
    base = loadTsConfigSync(extendedConfig, extendedPaths) ?? {};
  } else {
    if (!extendedConfig.endsWith('.json')) {
      extendedConfig += '.json';
    }

    const currentDir = dirname(configFilePath);
    const extendedConfigPath = join(currentDir, extendedConfig);

    if (extendedPaths.includes(extendedConfigPath)) {
      return config;
    }

    extendedPaths.push(extendedConfigPath);
    base = loadTsConfigSync(extendedConfigPath, extendedPaths) ?? {};
  }

  // baseUrl should be interpreted as relative to the base tsconfig, but we need
  // to update it so it is relative to the original tsconfig being loaded
  if (base?.compilerOptions?.baseUrl) {
    const extendsDir = dirname(extendedConfig);
    base.compilerOptions.baseUrl = join(
      extendsDir,
      base.compilerOptions.baseUrl,
    );
  }

  return {
    ...base,
    ...config,
    compilerOptions: {
      ...base.compilerOptions,
      ...config.compilerOptions,
    },
  };
};

/**
 * Loads a tsconfig file while also resolving the `extends` path.
 */
const loadTsConfig = async (
  configFilePath: string,
  extendedPaths: string[],
  ignoreExtends = false,
): Promise<TsConfigJson | undefined> => {
  if (!(await isFileOrDirectory(configFilePath))) return undefined;

  const configString = await readFile(configFilePath, 'utf8');
  const jsonString = StripBom(configString);
  const config = parseTsConfigJson(jsonString);
  let extendedConfig = config?.extends;

  if (!config || !extendedConfig || ignoreExtends) return config;

  let base: TsConfigJson;

  if (parseFilePath(extendedConfig).isPackage) {
    const newConfigPath = await resolvePackage(extendedConfig);

    if (!newConfigPath) {
      return config;
    } else if (await isDirectory(newConfigPath)) {
      extendedConfig = join(newConfigPath, DEFAULT_SEARCH_NAME);
    } else if (await isFile(newConfigPath)) {
      extendedConfig = newConfigPath;
    } else if (await isFile(`${newConfigPath}.json`)) {
      extendedConfig = `${newConfigPath}.json`;
    }

    if (extendedPaths.includes(extendedConfig)) {
      return config;
    }

    extendedPaths.push(extendedConfig);
    base = (await loadTsConfig(extendedConfig, extendedPaths)) ?? {};
  } else {
    if (!extendedConfig.endsWith('.json')) {
      extendedConfig += '.json';
    }

    const currentDir = dirname(configFilePath);
    const extendedConfigPath = join(currentDir, extendedConfig);

    if (extendedPaths.includes(extendedConfigPath)) {
      return config;
    }

    extendedPaths.push(extendedConfigPath);
    base = (await loadTsConfig(extendedConfigPath, extendedPaths)) ?? {};
  }

  // baseUrl should be interpreted as relative to the base tsconfig, but we need
  // to update it so it is relative to the original tsconfig being loaded
  if (base?.compilerOptions?.baseUrl) {
    const extendsDir = dirname(extendedConfig);
    base.compilerOptions.baseUrl = join(
      extendsDir,
      base.compilerOptions.baseUrl,
    );
  }

  return {
    ...base,
    ...config,
    compilerOptions: {
      ...base.compilerOptions,
      ...config.compilerOptions,
    },
  };
};

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

type TsConfigResolverParams = SetOptional<
  Required<Except<TsConfigResolverOptions, 'cache'>>,
  'filePath'
> & { cache: CacheStrategyType };

export const CacheStrategy = {
  /**
   * Caching never happens and the returned value is always recalculated.
   */
  Never: 'never',

  /**
   * The first time the `tsconfigResolver` method is run it will save a cached
   * value (by `searchName`) which will be returned every time after that. This
   * value will always be the same.
   */
  Always: 'always',

  /**
   * The cache will be used when the same directory (and searchName) is being
   * searched.
   */
  Directory: 'directory',
} as const;

/**
 * The available cache strategies as a union of strings.
 */
export type CacheStrategyType = typeof CacheStrategy[keyof typeof CacheStrategy];

const cacheObject = {
  [CacheStrategy.Always]: new Map<string, TsConfigResult>(),
  [CacheStrategy.Directory]: new Map<string, TsConfigResult>(),
};

/**
 * Converts a boolean or string type into a cache strategy.
 */
const convertCacheToStrategy = (value: boolean | CacheStrategyType) =>
  value === false
    ? CacheStrategy.Never
    : value === true
    ? CacheStrategy.Always
    : value;

/**
 * Get the key to store in the cache.
 */
const cacheKey = ({
  cache,
  cwd,
  searchName,
  ignoreExtends,
}: Exclude<TsConfigResolverParams, 'filePath'>) =>
  cache === CacheStrategy.Always
    ? `${searchName} - ${ignoreExtends}`
    : `${join(cwd, searchName)} - ${ignoreExtends}`;

/**
 * Based on the options passed in, retrieve the value from the cache or return
 * undefined if the value still needs to be calculated.
 */
const getCache = (
  options: TsConfigResolverParams,
): TsConfigResult | undefined => {
  if (options.cache === CacheStrategy.Always) {
    return cacheObject[CacheStrategy.Always].get(cacheKey(options));
  }

  if (options.cache === CacheStrategy.Directory) {
    return cacheObject[CacheStrategy.Always].get(cacheKey(options));
  }

  return undefined;
};

/**
 * Updates the cache with the provided result.
 */
const updateCache = (
  options: TsConfigResolverParams,
  result: TsConfigResult,
): void => {
  if (options.cache === CacheStrategy.Always) {
    cacheObject[CacheStrategy.Always].set(cacheKey(options), result);
  } else if (options.cache === CacheStrategy.Directory) {
    cacheObject[CacheStrategy.Always].set(cacheKey(options), result);
  }
};

/**
 * Clears the cache.
 */
export const clearCache = () => {
  for (const map of Object.values(cacheObject)) {
    map.clear();
  }
};

/**
 * Synchronously get the nearest tsconfig by walking up the directory.
 */
const getTsConfigResultSync = ({
  cwd,
  searchName,
  filePath,
  ignoreExtends,
}: Except<TsConfigResolverParams, 'cache'>): TsConfigResult => {
  const configPath = resolveConfigPathSync(cwd, searchName, filePath);

  if (!configPath) {
    return {
      exists: false,
      reason: TsConfigErrorReason.NotFound,
    };
  }

  // This path will be mutated to include all paths that have been found.
  const extendedPaths: string[] = [];

  const config = loadTsConfigSync(configPath, extendedPaths, ignoreExtends);

  if (!config) {
    return {
      exists: false,
      reason: TsConfigErrorReason.InvalidConfig,
      path: configPath,
    };
  }

  return {
    exists: true,
    path: configPath,
    extendedPaths,
    config,
    isCircular: extendedPaths.includes(configPath),
  };
};

/**
 * Get the nearest tsconfig by walking up the directory.
 */
const getTsConfigResult = async ({
  cwd,
  searchName,
  filePath,
  ignoreExtends,
}: Except<TsConfigResolverParams, 'cache'>): Promise<TsConfigResult> => {
  const configPath = await resolveConfigPath(cwd, searchName, filePath);

  if (!configPath) {
    return {
      exists: false,
      reason: TsConfigErrorReason.NotFound,
    };
  }

  // This path will be mutated to include all paths that have been found.
  const extendedPaths: string[] = [];

  const config = await loadTsConfig(configPath, extendedPaths, ignoreExtends);

  if (!config) {
    return {
      exists: false,
      reason: TsConfigErrorReason.InvalidConfig,
      path: configPath,
    };
  }

  return {
    exists: true,
    path: configPath,
    extendedPaths,
    config,
    isCircular: extendedPaths.includes(configPath),
  };
};

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
export function tsconfigResolverSync({
  filePath,
  cwd = process.cwd(),
  cache: shouldCache = filePath ? CacheStrategy.Always : CacheStrategy.Never,
  searchName = DEFAULT_SEARCH_NAME,
  ignoreExtends = false,
}: TsConfigResolverOptions = {}): TsConfigResult {
  const cacheStrategy = convertCacheToStrategy(shouldCache);
  const cache = getCache({
    cwd,
    cache: cacheStrategy,
    searchName,
    filePath,
    ignoreExtends,
  });

  if (cache) {
    return cache;
  }

  const result = getTsConfigResultSync({
    cwd,
    searchName,
    filePath,
    ignoreExtends,
  });

  updateCache(
    { cwd, cache: cacheStrategy, searchName, filePath, ignoreExtends },
    result,
  );

  return result;
}

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
export async function tsconfigResolver({
  filePath,
  cwd = process.cwd(),
  cache: shouldCache = filePath ? CacheStrategy.Always : CacheStrategy.Never,
  searchName = DEFAULT_SEARCH_NAME,
  ignoreExtends = false,
}: TsConfigResolverOptions = {}): Promise<TsConfigResult> {
  const cacheStrategy = convertCacheToStrategy(shouldCache);
  const cache = getCache({
    cwd,
    cache: cacheStrategy,
    searchName,
    filePath,
    ignoreExtends,
  });

  if (cache) {
    return cache;
  }

  const result = await getTsConfigResult({
    cwd,
    searchName,
    filePath,
    ignoreExtends,
  });

  updateCache(
    { cwd, cache: cacheStrategy, searchName, filePath, ignoreExtends },
    result,
  );

  return result;
}
