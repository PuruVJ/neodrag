'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var module$1 = require('module');
var path = require('path');
var node_url = require('node:url');
var vm = require('vm');
var mlly = require('mlly');
var pathe = require('pathe');
var createDebug = require('debug');
var utils = require('./utils.cjs');
var sourceMap = require('./source-map.cjs');
require('fs');
require('source-map-support');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var vm__default = /*#__PURE__*/_interopDefaultLegacy(vm);
var createDebug__default = /*#__PURE__*/_interopDefaultLegacy(createDebug);

const debugExecute = createDebug__default["default"]("vite-node:client:execute");
const debugNative = createDebug__default["default"]("vite-node:client:native");
const clientStub = {
  injectQuery: (id) => id,
  createHotContext() {
    return {
      accept: () => {
      },
      prune: () => {
      },
      dispose: () => {
      },
      decline: () => {
      },
      invalidate: () => {
      },
      on: () => {
      }
    };
  },
  updateStyle(id, css) {
    if (typeof document === "undefined")
      return;
    const element = document.getElementById(id);
    if (element)
      element.remove();
    const head = document.querySelector("head");
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.id = id;
    style.innerHTML = css;
    head == null ? void 0 : head.appendChild(style);
  }
};
const DEFAULT_REQUEST_STUBS = {
  "/@vite/client": clientStub,
  "@vite/client": clientStub
};
class ModuleCacheMap extends Map {
  normalizePath(fsPath) {
    return utils.normalizeModuleId(fsPath);
  }
  update(fsPath, mod) {
    fsPath = this.normalizePath(fsPath);
    if (!super.has(fsPath))
      super.set(fsPath, mod);
    else
      Object.assign(super.get(fsPath), mod);
    return this;
  }
  set(fsPath, mod) {
    fsPath = this.normalizePath(fsPath);
    return super.set(fsPath, mod);
  }
  get(fsPath) {
    fsPath = this.normalizePath(fsPath);
    if (!super.has(fsPath))
      super.set(fsPath, {});
    return super.get(fsPath);
  }
  delete(fsPath) {
    fsPath = this.normalizePath(fsPath);
    return super.delete(fsPath);
  }
  invalidateDepTree(ids, invalidated = /* @__PURE__ */ new Set()) {
    for (const _id of ids) {
      const id = this.normalizePath(_id);
      if (invalidated.has(id))
        continue;
      invalidated.add(id);
      const mod = super.get(id);
      if (mod == null ? void 0 : mod.importers)
        this.invalidateDepTree(mod.importers, invalidated);
      super.delete(id);
    }
    return invalidated;
  }
  invalidateSubDepTree(ids, invalidated = /* @__PURE__ */ new Set()) {
    for (const _id of ids) {
      const id = this.normalizePath(_id);
      if (invalidated.has(id))
        continue;
      invalidated.add(id);
      const subIds = Array.from(super.entries()).filter(([, mod]) => {
        var _a;
        return (_a = mod.importers) == null ? void 0 : _a.has(id);
      }).map(([key]) => key);
      subIds.length && this.invalidateSubDepTree(subIds, invalidated);
      super.delete(id);
    }
    return invalidated;
  }
  getSourceMap(id) {
    const cache = this.get(id);
    if (cache.map)
      return cache.map;
    const map = cache.code && sourceMap.extractSourceMap(cache.code);
    if (map) {
      cache.map = map;
      return map;
    }
    return null;
  }
}
class ViteNodeRunner {
  constructor(options) {
    this.options = options;
    this.root = options.root ?? process.cwd();
    this.moduleCache = options.moduleCache ?? new ModuleCacheMap();
    this.debug = options.debug ?? (typeof process !== "undefined" ? !!process.env.VITE_NODE_DEBUG_RUNNER : false);
  }
  async executeFile(file) {
    const url = `/@fs/${utils.slash(pathe.resolve(file))}`;
    return await this.cachedRequest(url, url, []);
  }
  async executeId(rawId) {
    const [id, url] = await this.resolveUrl(rawId);
    return await this.cachedRequest(id, url, []);
  }
  getSourceMap(id) {
    return this.moduleCache.getSourceMap(id);
  }
  async cachedRequest(id, fsPath, callstack) {
    const importee = callstack[callstack.length - 1];
    const mod = this.moduleCache.get(fsPath);
    if (!mod.importers)
      mod.importers = /* @__PURE__ */ new Set();
    if (importee)
      mod.importers.add(importee);
    if (callstack.includes(fsPath) && mod.exports)
      return mod.exports;
    if (mod.promise)
      return mod.promise;
    const promise = this.directRequest(id, fsPath, callstack);
    Object.assign(mod, { promise, evaluated: false });
    try {
      return await promise;
    } finally {
      mod.evaluated = true;
    }
  }
  shouldResolveId(id, _importee) {
    return !utils.isInternalRequest(id) && !mlly.isNodeBuiltin(id);
  }
  async resolveUrl(id, importee) {
    if (!this.shouldResolveId(id))
      return [id, id];
    if (importee && id.startsWith(utils.VALID_ID_PREFIX))
      importee = void 0;
    id = utils.normalizeRequestId(id, this.options.base);
    if (!this.options.resolveId)
      return [id, utils.toFilePath(id, this.root)];
    const resolved = await this.options.resolveId(id, importee);
    const resolvedId = resolved ? utils.normalizeRequestId(resolved.id, this.options.base) : id;
    const fsPath = resolved ? resolvedId : utils.toFilePath(id, this.root);
    return [resolvedId, fsPath];
  }
  async dependencyRequest(id, fsPath, callstack) {
    var _a;
    const getStack = () => {
      return `stack:
${[...callstack, fsPath].reverse().map((p) => `- ${p}`).join("\n")}`;
    };
    let debugTimer;
    if (this.debug)
      debugTimer = setTimeout(() => console.warn(() => `module ${fsPath} takes over 2s to load.
${getStack()}`), 2e3);
    try {
      if (callstack.includes(fsPath)) {
        const depExports = (_a = this.moduleCache.get(fsPath)) == null ? void 0 : _a.exports;
        if (depExports)
          return depExports;
        throw new Error(`[vite-node] Failed to resolve circular dependency, ${getStack()}`);
      }
      return await this.cachedRequest(id, fsPath, callstack);
    } finally {
      if (debugTimer)
        clearTimeout(debugTimer);
    }
  }
  async directRequest(id, fsPath, _callstack) {
    const moduleId = utils.normalizeModuleId(fsPath);
    const callstack = [..._callstack, moduleId];
    const mod = this.moduleCache.get(fsPath);
    const request = async (dep) => {
      const [id2, depFsPath] = await this.resolveUrl(dep, fsPath);
      return this.dependencyRequest(id2, depFsPath, callstack);
    };
    const requestStubs = this.options.requestStubs || DEFAULT_REQUEST_STUBS;
    if (id in requestStubs)
      return requestStubs[id];
    let { code: transformed, externalize } = await this.options.fetchModule(id);
    if (externalize) {
      debugNative(externalize);
      const exports2 = await this.interopedImport(externalize);
      mod.exports = exports2;
      return exports2;
    }
    if (transformed == null)
      throw new Error(`[vite-node] Failed to load "${id}" imported from ${callstack[callstack.length - 2]}`);
    const modulePath = utils.cleanUrl(moduleId);
    const href = node_url.pathToFileURL(modulePath).href;
    const meta = { url: href };
    const exports = /* @__PURE__ */ Object.create(null);
    Object.defineProperty(exports, Symbol.toStringTag, {
      value: "Module",
      enumerable: false,
      configurable: false
    });
    const cjsExports = new Proxy(exports, {
      set: (_, p, value) => {
        if (p === "default" && this.shouldInterop(modulePath, { default: value })) {
          exportAll(cjsExports, value);
          exports.default = value;
          return true;
        }
        if (!Reflect.has(exports, "default"))
          exports.default = {};
        if (utils.isPrimitive(exports.default)) {
          defineExport(exports, p, () => void 0);
          return true;
        }
        exports.default[p] = value;
        if (p !== "default")
          defineExport(exports, p, () => value);
        return true;
      }
    });
    Object.assign(mod, { code: transformed, exports });
    const __filename = node_url.fileURLToPath(href);
    const moduleProxy = {
      set exports(value) {
        exportAll(cjsExports, value);
        exports.default = value;
      },
      get exports() {
        return cjsExports;
      }
    };
    let hotContext;
    if (this.options.createHotContext) {
      Object.defineProperty(meta, "hot", {
        enumerable: true,
        get: () => {
          var _a, _b;
          hotContext || (hotContext = (_b = (_a = this.options).createHotContext) == null ? void 0 : _b.call(_a, this, `/@fs/${fsPath}`));
          return hotContext;
        },
        set: (value) => {
          hotContext = value;
        }
      });
    }
    const context = this.prepareContext({
      __vite_ssr_import__: request,
      __vite_ssr_dynamic_import__: request,
      __vite_ssr_exports__: exports,
      __vite_ssr_exportAll__: (obj) => exportAll(exports, obj),
      __vite_ssr_import_meta__: meta,
      require: module$1.createRequire(href),
      exports: cjsExports,
      module: moduleProxy,
      __filename,
      __dirname: path.dirname(__filename)
    });
    debugExecute(__filename);
    if (transformed[0] === "#")
      transformed = transformed.replace(/^\#\!.*/, (s) => " ".repeat(s.length));
    const codeDefinition = `'use strict';async (${Object.keys(context).join(",")})=>{{`;
    const code = `${codeDefinition}${transformed}
}}`;
    const fn = vm__default["default"].runInThisContext(code, {
      filename: __filename,
      lineOffset: 0,
      columnOffset: -codeDefinition.length
    });
    await fn(...Object.values(context));
    return exports;
  }
  prepareContext(context) {
    return context;
  }
  shouldInterop(path, mod) {
    if (this.options.interopDefault === false)
      return false;
    return !path.endsWith(".mjs") && "default" in mod;
  }
  async interopedImport(path) {
    const importedModule = await (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(path);
    if (!this.shouldInterop(path, importedModule))
      return importedModule;
    const { mod, defaultExport } = interopModule(importedModule);
    return new Proxy(mod, {
      get(mod2, prop) {
        if (prop === "default")
          return defaultExport;
        return mod2[prop] ?? (defaultExport == null ? void 0 : defaultExport[prop]);
      },
      has(mod2, prop) {
        if (prop === "default")
          return defaultExport !== void 0;
        return prop in mod2 || defaultExport && prop in defaultExport;
      }
    });
  }
}
function interopModule(mod) {
  if (utils.isPrimitive(mod)) {
    return {
      mod: { default: mod },
      defaultExport: mod
    };
  }
  let defaultExport = "default" in mod ? mod.default : mod;
  if (!utils.isPrimitive(defaultExport) && "__esModule" in defaultExport) {
    mod = defaultExport;
    if ("default" in defaultExport)
      defaultExport = defaultExport.default;
  }
  return { mod, defaultExport };
}
function defineExport(exports, key, value) {
  Object.defineProperty(exports, key, {
    enumerable: true,
    configurable: true,
    get: value
  });
}
function exportAll(exports, sourceModule) {
  if (exports === sourceModule)
    return;
  if (utils.isPrimitive(sourceModule) || Array.isArray(sourceModule))
    return;
  for (const key in sourceModule) {
    if (key !== "default") {
      try {
        defineExport(exports, key, () => sourceModule[key]);
      } catch (_err) {
      }
    }
  }
}

exports.DEFAULT_REQUEST_STUBS = DEFAULT_REQUEST_STUBS;
exports.ModuleCacheMap = ModuleCacheMap;
exports.ViteNodeRunner = ViteNodeRunner;
