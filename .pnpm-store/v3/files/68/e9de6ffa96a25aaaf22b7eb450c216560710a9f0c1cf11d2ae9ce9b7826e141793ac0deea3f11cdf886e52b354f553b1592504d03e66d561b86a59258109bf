import { compile } from "./compile.js";
const configCache = /* @__PURE__ */ new WeakMap();
function isCached(config, filename) {
  return configCache.has(config) && configCache.get(config).has(filename);
}
function getCachedCompileResult(config, filename) {
  if (!isCached(config, filename))
    return null;
  return configCache.get(config).get(filename);
}
function invalidateCompilation(config, filename) {
  if (configCache.has(config)) {
    const cache = configCache.get(config);
    cache.delete(filename);
  }
}
async function cachedCompilation(props) {
  const { astroConfig, filename } = props;
  let cache;
  if (!configCache.has(astroConfig)) {
    cache = /* @__PURE__ */ new Map();
    configCache.set(astroConfig, cache);
  } else {
    cache = configCache.get(astroConfig);
  }
  if (cache.has(filename)) {
    return cache.get(filename);
  }
  const compileResult = await compile(props);
  cache.set(filename, compileResult);
  return compileResult;
}
export {
  cachedCompilation,
  getCachedCompileResult,
  invalidateCompilation,
  isCached
};
