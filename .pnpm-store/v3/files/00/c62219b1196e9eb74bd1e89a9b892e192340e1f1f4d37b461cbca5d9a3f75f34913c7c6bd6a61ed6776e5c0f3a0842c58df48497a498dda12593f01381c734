'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var path = require('path');
var JSON5 = _interopDefault(require('json5'));
var resolvePackageNpm = _interopDefault(require('resolve'));
var StripBom = _interopDefault(require('strip-bom'));

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

// A type of promise-like that resolves synchronously and supports only one observer

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

var _cacheObject;

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
var tsconfigResolver = function tsconfigResolver(_temp17) {
  var _ref6 = _temp17 === void 0 ? {} : _temp17,
      filePath = _ref6.filePath,
      _ref6$cwd = _ref6.cwd,
      cwd = _ref6$cwd === void 0 ? process.cwd() : _ref6$cwd,
      _ref6$cache = _ref6.cache,
      shouldCache = _ref6$cache === void 0 ? filePath ? CacheStrategy.Always : CacheStrategy.Never : _ref6$cache,
      _ref6$searchName = _ref6.searchName,
      searchName = _ref6$searchName === void 0 ? DEFAULT_SEARCH_NAME : _ref6$searchName,
      _ref6$ignoreExtends = _ref6.ignoreExtends,
      ignoreExtends = _ref6$ignoreExtends === void 0 ? false : _ref6$ignoreExtends;

  try {
    var cacheStrategy = convertCacheToStrategy(shouldCache);
    var cache = getCache({
      cwd: cwd,
      cache: cacheStrategy,
      searchName: searchName,
      filePath: filePath,
      ignoreExtends: ignoreExtends
    });

    if (cache) {
      return Promise.resolve(cache);
    }

    return Promise.resolve(getTsConfigResult({
      cwd: cwd,
      searchName: searchName,
      filePath: filePath,
      ignoreExtends: ignoreExtends
    })).then(function (result) {
      updateCache({
        cwd: cwd,
        cache: cacheStrategy,
        searchName: searchName,
        filePath: filePath,
        ignoreExtends: ignoreExtends
      }, result);
      return result;
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var readFile = fs.promises.readFile,
    stat = fs.promises.stat;
/** The default search name used. */

var DEFAULT_SEARCH_NAME = 'tsconfig.json';
/**
 * Extends the default node file parser and determines whether the path provided
 * should be resolved from the node modules or directly from the provided path.
 */

var parseFilePath = function parseFilePath(file, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      windows = _ref.windows;

  var isWindows = windows !== null && windows !== void 0 ? windows : process.platform === 'win32';
  var parser = isWindows ? path.win32.parse : path.parse;
  var parsedPath = parser(file);
  return _extends({}, parsedPath, {
    isAbsolute: Boolean(parsedPath.root),
    isPackage: !file.startsWith('.') && !parsedPath.root
  });
};
/**
 * The reason that the tsconfig exist flag is false.
 */


var TsConfigErrorReason = {
  /**
   * The `tsconfig` file could not be found.
   */
  NotFound: 'not-found',

  /**
   * The file was found but the configuration was invalid.
   */
  InvalidConfig: 'invalid-config'
};
/**
 * Synchronously walk up the path until a `tsconfig` is located.
 */

var walkForTsConfigSync = function walkForTsConfigSync(directory) {
  var configPath = path.join(directory, './tsconfig.json');

  if (isFileOrDirectorySync(configPath)) {
    return configPath;
  }

  var parentDirectory = path.join(directory, '../'); // If we reached the top

  if (directory === parentDirectory) {
    return undefined;
  }

  return walkForTsConfigSync(parentDirectory);
};
/**
 * Walk up the path until a `tsconfig` is located.
 */


var walkForTsConfig = function walkForTsConfig(directory) {
  try {
    var _exit2 = false;
    var configPath = path.join(directory, './tsconfig.json');
    return Promise.resolve(isFileOrDirectory(configPath)).then(function (_isFileOrDirectory) {
      if (_isFileOrDirectory) {
        _exit2 = true;
        return configPath;
      }

      // Step up one level in the directory path.
      var parentDirectory = path.join(directory, '../'); // If we reached the top

      return directory === parentDirectory ? undefined : walkForTsConfig(parentDirectory);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
/**
 * Synchronously check that the passed string is a directory.
 */


var isDirectorySync = function isDirectorySync(directory) {
  try {
    return fs.statSync(directory).isDirectory();
  } catch (_unused) {
    return false;
  }
};
/**
 * Check that the passed string is a directory.
 */


var isDirectory = function isDirectory(directory) {
  return Promise.resolve(_catch(function () {
    return Promise.resolve(stat(directory)).then(function (stats) {
      return stats.isDirectory();
    });
  }, function () {
    return false;
  }));
};
/**
 * Synchronously check that the passed filePath is a valid file.
 */


var isFileSync = function isFileSync(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (_unused2) {
    return false;
  }
};
/**
 * Check that the passed filePath is a valid file.
 */


var isFile = function isFile(filePath) {
  return Promise.resolve(_catch(function () {
    return Promise.resolve(stat(filePath)).then(function (stats) {
      return stats.isFile();
    });
  }, function () {
    return false;
  }));
};
/**
 * Synchronously check that the provided `filePath` is a file or directory.
 */


var isFileOrDirectorySync = function isFileOrDirectorySync(filePath) {
  return isFileSync(filePath) || isDirectorySync(filePath);
};
/**
 * Check that the provided `filePath` is a file or directory.
 */


var isFileOrDirectory = function isFileOrDirectory(filePath) {
  try {
    var _exit5 = false;
    return Promise.resolve(isFile(filePath)).then(function (_isFile) {
      var _exit4 = false;

      if (_isFile) {
        _exit5 = true;
        return true;
      }

      return Promise.resolve(isDirectory(filePath)).then(function (_isDirectory) {
        if (_isDirectory) {
          _exit4 = true;
          return true;
        }

        return false;
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
/**
 * Synchronously resolves an npm package by the given name.
 */


var resolvePackageSync = function resolvePackageSync(name, basedir) {
  try {
    return resolvePackageNpm.sync(name, {
      basedir: basedir,
      extensions: ['.json', '.js']
    });
  } catch (_unused3) {
    return;
  }
};
/**
 * Resolves an npm package by the given name.
 */


var resolvePackage = function resolvePackage(name, basedir) {
  return new Promise(function (resolve, reject) {
    resolvePackageNpm(name, {
      basedir: basedir,
      extensions: ['.json', '.js']
    }, function (error, resolved) {
      if (error) {
        reject(error);
      } else {
        resolve(resolved);
      }
    });
  });
};
/**
 * Synchronously checks a filePath exists and if it can be resolved.
 */


var resolveFilePathSync = function resolveFilePathSync(searchName, filePath) {
  var cwd = process.cwd();

  if (!filePath) {
    return;
  }

  var resolvedPath;

  if (filePath.startsWith('npm:')) {
    resolvedPath = resolvePackageSync(filePath.replace('npm:', ''), cwd);
  } else {
    resolvedPath = path.resolve(cwd, filePath);
  }

  if (!resolvedPath || !isDirectorySync(resolvedPath)) {
    return resolvedPath;
  }

  return path.resolve(resolvedPath, searchName);
};
/**
 * When a filePath exists check if it can be resolved.
 */


var resolveFilePath = function resolveFilePath(searchName, filePath) {
  try {
    var _temp6 = function _temp6() {
      var _exit6 = false;

      function _temp3(_isDirectory2) {
        if (_temp2 || !_isDirectory2) {
          _exit6 = true;
          return resolvedPath;
        }

        return path.resolve(resolvedPath, searchName);
      }

      var _temp2 = !resolvedPath;

      return _temp2 ? _temp3(_temp2) : Promise.resolve(isDirectory(resolvedPath)).then(_temp3);
    };

    var cwd = process.cwd();

    if (!filePath) {
      return Promise.resolve();
    }

    var resolvedPath;

    var _temp7 = function () {
      if (filePath.startsWith('npm:')) {
        return Promise.resolve(resolvePackage(filePath.replace('npm:', ''), cwd)).then(function (_resolvePackage) {
          resolvedPath = _resolvePackage;
        });
      } else {
        resolvedPath = path.resolve(cwd, filePath);
      }
    }();

    return Promise.resolve(_temp7 && _temp7.then ? _temp7.then(_temp6) : _temp6(_temp7));
  } catch (e) {
    return Promise.reject(e);
  }
};
/**
 * Get the desired path to the configuration.
 */


var resolveConfigPathSync = function resolveConfigPathSync(cwd, searchName, filePath) {
  var resolvedFilePath = resolveFilePathSync(searchName, filePath);

  if (resolvedFilePath) {
    return resolvedFilePath;
  }

  if (searchName !== DEFAULT_SEARCH_NAME) {
    var resolvedSearchName = path.resolve(cwd, searchName);
    var absolutePath = isDirectorySync(resolvedSearchName) ? path.resolve(resolvedSearchName, 'tsconfig.json') : resolvedSearchName;
    return isFileSync(absolutePath) ? absolutePath : undefined;
  }

  if (isFileSync(cwd)) {
    return path.resolve(cwd);
  }

  var configAbsolutePath = walkForTsConfigSync(cwd);
  return configAbsolutePath ? path.resolve(configAbsolutePath) : undefined;
};
/**
 * Get the desired path to the configuration.
 */


var resolveConfigPath = function resolveConfigPath(cwd, searchName, filePath) {
  try {
    return Promise.resolve(resolveFilePath(searchName, filePath)).then(function (resolvedFilePath) {
      var _exit7 = false;

      function _temp9(_result) {
        var _exit8 = false;
        if (_exit7) return _result;
        return Promise.resolve(isFile(cwd)).then(function (_isFile3) {
          if (_isFile3) {
            _exit8 = true;
            return path.resolve(cwd);
          }

          return Promise.resolve(walkForTsConfig(cwd)).then(function (configAbsolutePath) {
            return configAbsolutePath ? path.resolve(configAbsolutePath) : undefined;
          });
        });
      }

      if (resolvedFilePath) {
        return resolvedFilePath;
      }

      var _temp8 = function () {
        if (searchName !== DEFAULT_SEARCH_NAME) {
          var resolvedSearchName = path.resolve(cwd, searchName);
          return Promise.resolve(isDirectory(resolvedSearchName)).then(function (_isDirectory3) {
            var absolutePath = _isDirectory3 ? path.resolve(resolvedSearchName, 'tsconfig.json') : resolvedSearchName;
            _exit7 = true;
            return Promise.resolve(isFile(absolutePath)).then(function (_isFile2) {
              return _isFile2 ? absolutePath : undefined;
            });
          });
        }
      }();

      return _temp8 && _temp8.then ? _temp8.then(_temp9) : _temp9(_temp8);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
/**
 * Loads the `jsonString` and returns it as a TsConfigJson object.
 */


var parseTsConfigJson = function parseTsConfigJson(jsonString) {
  try {
    var json = JSON5.parse(jsonString);
    return json && typeof json === 'object' ? json : undefined;
  } catch (_unused4) {
    return undefined;
  }
};
/**
 * Synchronously loads a tsconfig file while also resolving the `extends` path.
 */


var loadTsConfigSync = function loadTsConfigSync(configFilePath, extendedPaths, ignoreExtends) {
  var _base, _base$compilerOptions;

  if (ignoreExtends === void 0) {
    ignoreExtends = false;
  }

  if (!isFileOrDirectorySync(configFilePath)) return undefined;
  var configString = fs.readFileSync(configFilePath, 'utf8');
  var jsonString = StripBom(configString);
  var config = parseTsConfigJson(jsonString);
  var extendedConfig = config === null || config === void 0 ? void 0 : config["extends"];
  if (!config || !extendedConfig || ignoreExtends) return config;
  var base;

  if (parseFilePath(extendedConfig).isPackage) {
    var _loadTsConfigSync;

    var newConfigPath = resolvePackageSync(extendedConfig);

    if (!newConfigPath) {
      return config;
    } else if (isDirectorySync(newConfigPath)) {
      extendedConfig = path.join(newConfigPath, DEFAULT_SEARCH_NAME);
    } else if (isFileSync(newConfigPath)) {
      extendedConfig = newConfigPath;
    } else if (isFileSync(newConfigPath + ".json")) {
      extendedConfig = newConfigPath + ".json";
    }

    if (extendedPaths.includes(extendedConfig)) {
      return config;
    }

    extendedPaths.push(extendedConfig);
    base = (_loadTsConfigSync = loadTsConfigSync(extendedConfig, extendedPaths)) !== null && _loadTsConfigSync !== void 0 ? _loadTsConfigSync : {};
  } else {
    var _loadTsConfigSync2;

    if (!extendedConfig.endsWith('.json')) {
      extendedConfig += '.json';
    }

    var currentDir = path.dirname(configFilePath);
    var extendedConfigPath = path.join(currentDir, extendedConfig);

    if (extendedPaths.includes(extendedConfigPath)) {
      return config;
    }

    extendedPaths.push(extendedConfigPath);
    base = (_loadTsConfigSync2 = loadTsConfigSync(extendedConfigPath, extendedPaths)) !== null && _loadTsConfigSync2 !== void 0 ? _loadTsConfigSync2 : {};
  } // baseUrl should be interpreted as relative to the base tsconfig, but we need
  // to update it so it is relative to the original tsconfig being loaded


  if ((_base = base) === null || _base === void 0 ? void 0 : (_base$compilerOptions = _base.compilerOptions) === null || _base$compilerOptions === void 0 ? void 0 : _base$compilerOptions.baseUrl) {
    var extendsDir = path.dirname(extendedConfig);
    base.compilerOptions.baseUrl = path.join(extendsDir, base.compilerOptions.baseUrl);
  }

  return _extends({}, base, {}, config, {
    compilerOptions: _extends({}, base.compilerOptions, {}, config.compilerOptions)
  });
};
/**
 * Loads a tsconfig file while also resolving the `extends` path.
 */


var loadTsConfig = function loadTsConfig(configFilePath, extendedPaths, ignoreExtends) {
  if (ignoreExtends === void 0) {
    ignoreExtends = false;
  }

  try {
    var _exit12 = false;
    return Promise.resolve(isFileOrDirectory(configFilePath)).then(function (_isFileOrDirectory2) {
      if (!_isFileOrDirectory2) {
        _exit12 = true;
        return undefined;
      }

      return Promise.resolve(readFile(configFilePath, 'utf8')).then(function (configString) {
        var _exit10 = false;

        function _temp15(_result2) {
          var _base2, _base2$compilerOption;

          if (_exit10) return _result2;

          // baseUrl should be interpreted as relative to the base tsconfig, but we need
          // to update it so it is relative to the original tsconfig being loaded
          if ((_base2 = base) === null || _base2 === void 0 ? void 0 : (_base2$compilerOption = _base2.compilerOptions) === null || _base2$compilerOption === void 0 ? void 0 : _base2$compilerOption.baseUrl) {
            var extendsDir = path.dirname(extendedConfig);
            base.compilerOptions.baseUrl = path.join(extendsDir, base.compilerOptions.baseUrl);
          }

          return _extends({}, base, {}, config, {
            compilerOptions: _extends({}, base.compilerOptions, {}, config.compilerOptions)
          });
        }

        var jsonString = StripBom(configString);
        var config = parseTsConfigJson(jsonString);
        var extendedConfig = config === null || config === void 0 ? void 0 : config["extends"];
        if (!config || !extendedConfig || ignoreExtends) return config;
        var base;

        var _temp14 = function () {
          if (parseFilePath(extendedConfig).isPackage) {
            return Promise.resolve(resolvePackage(extendedConfig)).then(function (newConfigPath) {
              var _exit11 = false;

              function _temp13(_result3) {
                if (_exit11) return _result3;

                if (extendedPaths.includes(extendedConfig)) {
                  _exit10 = true;
                  return config;
                }

                extendedPaths.push(extendedConfig);
                return Promise.resolve(loadTsConfig(extendedConfig, extendedPaths)).then(function (_loadTsConfig) {
                  base = _loadTsConfig !== null && _loadTsConfig !== void 0 ? _loadTsConfig : {};
                });
              }

              var _temp12 = function () {
                if (!newConfigPath) {
                  _exit10 = true;
                  return config;
                } else return Promise.resolve(isDirectory(newConfigPath)).then(function (_isDirectory4) {
                  var _temp11 = function () {
                    if (_isDirectory4) {
                      extendedConfig = path.join(newConfigPath, DEFAULT_SEARCH_NAME);
                    } else return Promise.resolve(isFile(newConfigPath)).then(function (_isFile4) {
                      var _temp10 = function () {
                        if (_isFile4) {
                          extendedConfig = newConfigPath;
                        } else return Promise.resolve(isFile(newConfigPath + ".json")).then(function (_isFile5) {
                          if (_isFile5) {
                            extendedConfig = newConfigPath + ".json";
                          }
                        });
                      }();

                      if (_temp10 && _temp10.then) return _temp10.then(function () {});
                    });
                  }();

                  if (_temp11 && _temp11.then) return _temp11.then(function () {});
                });
              }();

              return _temp12 && _temp12.then ? _temp12.then(_temp13) : _temp13(_temp12);
            });
          } else {
            if (!extendedConfig.endsWith('.json')) {
              extendedConfig += '.json';
            }

            var currentDir = path.dirname(configFilePath);
            var extendedConfigPath = path.join(currentDir, extendedConfig);

            if (extendedPaths.includes(extendedConfigPath)) {
              _exit10 = true;
              return config;
            }

            extendedPaths.push(extendedConfigPath);
            return Promise.resolve(loadTsConfig(extendedConfigPath, extendedPaths)).then(function (_loadTsConfig2) {
              base = _loadTsConfig2 !== null && _loadTsConfig2 !== void 0 ? _loadTsConfig2 : {};
            });
          }
        }();

        return _temp14 && _temp14.then ? _temp14.then(_temp15) : _temp15(_temp14);
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var CacheStrategy = {
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
  Directory: 'directory'
};
var cacheObject = (_cacheObject = {}, _cacheObject[CacheStrategy.Always] = /*#__PURE__*/new Map(), _cacheObject[CacheStrategy.Directory] = /*#__PURE__*/new Map(), _cacheObject);
/**
 * Converts a boolean or string type into a cache strategy.
 */

var convertCacheToStrategy = function convertCacheToStrategy(value) {
  return value === false ? CacheStrategy.Never : value === true ? CacheStrategy.Always : value;
};
/**
 * Get the key to store in the cache.
 */


var cacheKey = function cacheKey(_ref2) {
  var cache = _ref2.cache,
      cwd = _ref2.cwd,
      searchName = _ref2.searchName,
      ignoreExtends = _ref2.ignoreExtends;
  return cache === CacheStrategy.Always ? searchName + " - " + ignoreExtends : path.join(cwd, searchName) + " - " + ignoreExtends;
};
/**
 * Based on the options passed in, retrieve the value from the cache or return
 * undefined if the value still needs to be calculated.
 */


var getCache = function getCache(options) {
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


var updateCache = function updateCache(options, result) {
  if (options.cache === CacheStrategy.Always) {
    cacheObject[CacheStrategy.Always].set(cacheKey(options), result);
  } else if (options.cache === CacheStrategy.Directory) {
    cacheObject[CacheStrategy.Always].set(cacheKey(options), result);
  }
};
/**
 * Clears the cache.
 */


var clearCache = function clearCache() {
  for (var _i = 0, _Object$values = Object.values(cacheObject); _i < _Object$values.length; _i++) {
    var map = _Object$values[_i];
    map.clear();
  }
};
/**
 * Synchronously get the nearest tsconfig by walking up the directory.
 */

var getTsConfigResultSync = function getTsConfigResultSync(_ref3) {
  var cwd = _ref3.cwd,
      searchName = _ref3.searchName,
      filePath = _ref3.filePath,
      ignoreExtends = _ref3.ignoreExtends;
  var configPath = resolveConfigPathSync(cwd, searchName, filePath);

  if (!configPath) {
    return {
      exists: false,
      reason: TsConfigErrorReason.NotFound
    };
  } // This path will be mutated to include all paths that have been found.


  var extendedPaths = [];
  var config = loadTsConfigSync(configPath, extendedPaths, ignoreExtends);

  if (!config) {
    return {
      exists: false,
      reason: TsConfigErrorReason.InvalidConfig,
      path: configPath
    };
  }

  return {
    exists: true,
    path: configPath,
    extendedPaths: extendedPaths,
    config: config,
    isCircular: extendedPaths.includes(configPath)
  };
};
/**
 * Get the nearest tsconfig by walking up the directory.
 */


var getTsConfigResult = function getTsConfigResult(_ref4) {
  var cwd = _ref4.cwd,
      searchName = _ref4.searchName,
      filePath = _ref4.filePath,
      ignoreExtends = _ref4.ignoreExtends;

  try {
    return Promise.resolve(resolveConfigPath(cwd, searchName, filePath)).then(function (configPath) {
      if (!configPath) {
        return {
          exists: false,
          reason: TsConfigErrorReason.NotFound
        };
      } // This path will be mutated to include all paths that have been found.


      var extendedPaths = [];
      return Promise.resolve(loadTsConfig(configPath, extendedPaths, ignoreExtends)).then(function (config) {
        return config ? {
          exists: true,
          path: configPath,
          extendedPaths: extendedPaths,
          config: config,
          isCircular: extendedPaths.includes(configPath)
        } : {
          exists: false,
          reason: TsConfigErrorReason.InvalidConfig,
          path: configPath
        };
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
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


function tsconfigResolverSync(_temp16) {
  var _ref5 = _temp16 === void 0 ? {} : _temp16,
      filePath = _ref5.filePath,
      _ref5$cwd = _ref5.cwd,
      cwd = _ref5$cwd === void 0 ? process.cwd() : _ref5$cwd,
      _ref5$cache = _ref5.cache,
      shouldCache = _ref5$cache === void 0 ? filePath ? CacheStrategy.Always : CacheStrategy.Never : _ref5$cache,
      _ref5$searchName = _ref5.searchName,
      searchName = _ref5$searchName === void 0 ? DEFAULT_SEARCH_NAME : _ref5$searchName,
      _ref5$ignoreExtends = _ref5.ignoreExtends,
      ignoreExtends = _ref5$ignoreExtends === void 0 ? false : _ref5$ignoreExtends;

  var cacheStrategy = convertCacheToStrategy(shouldCache);
  var cache = getCache({
    cwd: cwd,
    cache: cacheStrategy,
    searchName: searchName,
    filePath: filePath,
    ignoreExtends: ignoreExtends
  });

  if (cache) {
    return cache;
  }

  var result = getTsConfigResultSync({
    cwd: cwd,
    searchName: searchName,
    filePath: filePath,
    ignoreExtends: ignoreExtends
  });
  updateCache({
    cwd: cwd,
    cache: cacheStrategy,
    searchName: searchName,
    filePath: filePath,
    ignoreExtends: ignoreExtends
  }, result);
  return result;
}

exports.CacheStrategy = CacheStrategy;
exports.DEFAULT_SEARCH_NAME = DEFAULT_SEARCH_NAME;
exports.TsConfigErrorReason = TsConfigErrorReason;
exports.clearCache = clearCache;
exports.tsconfigResolver = tsconfigResolver;
exports.tsconfigResolverSync = tsconfigResolverSync;
//# sourceMappingURL=tsconfig-resolver.cjs.development.js.map
