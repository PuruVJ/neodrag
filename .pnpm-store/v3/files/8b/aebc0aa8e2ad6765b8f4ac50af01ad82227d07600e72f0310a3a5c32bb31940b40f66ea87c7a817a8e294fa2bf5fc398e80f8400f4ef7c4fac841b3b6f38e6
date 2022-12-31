'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var perf_hooks = require('perf_hooks');
var pathe = require('pathe');
var createDebug = require('debug');
var fs = require('fs');
var mlly = require('mlly');
var utils = require('./utils.cjs');
var picocolors = require('./chunk-picocolors.cjs');
var sourceMap = require('./source-map.cjs');
require('node:url');
require('tty');
require('source-map-support');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var createDebug__default = /*#__PURE__*/_interopDefaultLegacy(createDebug);

const ESM_EXT_RE = /\.(es|esm|esm-browser|esm-bundler|es6|module)\.js$/;
const ESM_FOLDER_RE = /\/(es|esm)\/(.*\.js)$/;
const defaultInline = [
  /virtual:/,
  /\.[mc]?ts$/
];
const depsExternal = [
  /\.cjs\.js$/,
  /\.mjs$/
];
function guessCJSversion(id) {
  if (id.match(ESM_EXT_RE)) {
    for (const i of [
      id.replace(ESM_EXT_RE, ".mjs"),
      id.replace(ESM_EXT_RE, ".umd.js"),
      id.replace(ESM_EXT_RE, ".cjs.js"),
      id.replace(ESM_EXT_RE, ".js")
    ]) {
      if (fs.existsSync(i))
        return i;
    }
  }
  if (id.match(ESM_FOLDER_RE)) {
    for (const i of [
      id.replace(ESM_FOLDER_RE, "/umd/$1"),
      id.replace(ESM_FOLDER_RE, "/cjs/$1"),
      id.replace(ESM_FOLDER_RE, "/lib/$1"),
      id.replace(ESM_FOLDER_RE, "/$1")
    ]) {
      if (fs.existsSync(i))
        return i;
    }
  }
}
const _defaultExternalizeCache = /* @__PURE__ */ new Map();
async function shouldExternalize(id, options, cache = _defaultExternalizeCache) {
  if (!cache.has(id))
    cache.set(id, _shouldExternalize(id, options));
  return cache.get(id);
}
async function _shouldExternalize(id, options) {
  if (mlly.isNodeBuiltin(id))
    return id;
  if (id.startsWith("data:"))
    return id;
  id = patchWindowsImportPath(id);
  if (matchExternalizePattern(id, options == null ? void 0 : options.inline))
    return false;
  if (matchExternalizePattern(id, options == null ? void 0 : options.external))
    return id;
  const isNodeModule = id.includes("/node_modules/");
  const guessCJS = isNodeModule && (options == null ? void 0 : options.fallbackCJS);
  id = guessCJS ? guessCJSversion(id) || id : id;
  if (matchExternalizePattern(id, defaultInline))
    return false;
  if (matchExternalizePattern(id, depsExternal))
    return id;
  const isDist = id.includes("/dist/");
  if ((isNodeModule || isDist) && await mlly.isValidNodeImport(id))
    return id;
  return false;
}
function matchExternalizePattern(id, patterns) {
  if (patterns == null)
    return false;
  if (patterns === true)
    return true;
  for (const ex of patterns) {
    if (typeof ex === "string") {
      if (id.includes(`/node_modules/${ex}/`))
        return true;
    } else {
      if (ex.test(id))
        return true;
    }
  }
  return false;
}
function patchWindowsImportPath(path) {
  if (path.match(/^\w:\\/))
    return `file:///${utils.slash(path)}`;
  else if (path.match(/^\w:\//))
    return `file:///${path}`;
  else
    return path;
}

function hashCode(s) {
  return s.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}
class Debugger {
  constructor(root, options) {
    this.options = options;
    this.externalizeMap = /* @__PURE__ */ new Map();
    if (options.dumpModules)
      this.dumpDir = pathe.resolve(root, options.dumpModules === true ? ".vite-node/dump" : options.dumpModules);
    if (this.dumpDir) {
      if (options.loadDumppedModules)
        console.info(picocolors.picocolors.exports.gray(`[vite-node] [debug] load modules from ${this.dumpDir}`));
      else
        console.info(picocolors.picocolors.exports.gray(`[vite-node] [debug] dump modules to ${this.dumpDir}`));
    }
    this.initPromise = this.clearDump();
  }
  async clearDump() {
    if (!this.dumpDir)
      return;
    if (!this.options.loadDumppedModules && fs.existsSync(this.dumpDir))
      await fs.promises.rm(this.dumpDir, { recursive: true, force: true });
    await fs.promises.mkdir(this.dumpDir, { recursive: true });
  }
  encodeId(id) {
    return `${id.replace(/[^\w@_-]/g, "_").replace(/_+/g, "_")}-${hashCode(id)}.js`;
  }
  async recordExternalize(id, path) {
    if (!this.dumpDir)
      return;
    this.externalizeMap.set(id, path);
    await this.writeInfo();
  }
  async dumpFile(id, result) {
    if (!result || !this.dumpDir)
      return;
    await this.initPromise;
    const name = this.encodeId(id);
    return await fs.promises.writeFile(pathe.join(this.dumpDir, name), `// ${id.replace(/\0/g, "\\0")}
${result.code}`, "utf-8");
  }
  async loadDump(id) {
    if (!this.dumpDir)
      return null;
    await this.initPromise;
    const name = this.encodeId(id);
    const path = pathe.join(this.dumpDir, name);
    if (!fs.existsSync(path))
      return null;
    const code = await fs.promises.readFile(path, "utf-8");
    return {
      code: code.replace(/^\/\/.*?\n/, ""),
      map: void 0
    };
  }
  async writeInfo() {
    if (!this.dumpDir)
      return;
    const info = JSON.stringify({
      time: new Date().toLocaleString(),
      externalize: Object.fromEntries(this.externalizeMap.entries())
    }, null, 2);
    return fs.promises.writeFile(pathe.join(this.dumpDir, "info.json"), info, "utf-8");
  }
}

const debugRequest = createDebug__default["default"]("vite-node:server:request");
class ViteNodeServer {
  constructor(server, options = {}) {
    this.server = server;
    this.options = options;
    this.fetchPromiseMap = /* @__PURE__ */ new Map();
    this.transformPromiseMap = /* @__PURE__ */ new Map();
    this.fetchCache = /* @__PURE__ */ new Map();
    this.externalizeCache = /* @__PURE__ */ new Map();
    var _a, _b;
    const ssrOptions = server.config.ssr;
    if (ssrOptions) {
      options.deps ?? (options.deps = {});
      if (ssrOptions.noExternal === true) {
        (_a = options.deps).inline ?? (_a.inline = true);
      } else if (options.deps.inline !== true) {
        (_b = options.deps).inline ?? (_b.inline = []);
        options.deps.inline.push(...utils.toArray(ssrOptions.noExternal));
      }
    }
    if (process.env.VITE_NODE_DEBUG_DUMP) {
      options.debug = Object.assign({
        dumpModules: !!process.env.VITE_NODE_DEBUG_DUMP,
        loadDumppedModules: process.env.VITE_NODE_DEBUG_DUMP === "load"
      }, options.debug ?? {});
    }
    if (options.debug)
      this.debugger = new Debugger(server.config.root, options.debug);
  }
  shouldExternalize(id) {
    return shouldExternalize(id, this.options.deps, this.externalizeCache);
  }
  async resolveId(id, importer) {
    if (importer && !importer.startsWith(this.server.config.root))
      importer = pathe.resolve(this.server.config.root, importer);
    const mode = importer && this.getTransformMode(importer) || "ssr";
    return this.server.pluginContainer.resolveId(id, importer, { ssr: mode === "ssr" });
  }
  getSourceMap(source) {
    var _a, _b;
    const fetchResult = (_a = this.fetchCache.get(source)) == null ? void 0 : _a.result;
    if (fetchResult == null ? void 0 : fetchResult.map)
      return fetchResult.map;
    const ssrTransformResult = (_b = this.server.moduleGraph.getModuleById(source)) == null ? void 0 : _b.ssrTransformResult;
    return (ssrTransformResult == null ? void 0 : ssrTransformResult.map) || null;
  }
  async fetchModule(id) {
    id = utils.normalizeModuleId(id);
    if (!this.fetchPromiseMap.has(id)) {
      this.fetchPromiseMap.set(
        id,
        this._fetchModule(id).then((r) => {
          return this.options.sourcemap !== true ? { ...r, map: void 0 } : r;
        }).finally(() => {
          this.fetchPromiseMap.delete(id);
        })
      );
    }
    return this.fetchPromiseMap.get(id);
  }
  async transformRequest(id) {
    if (!this.transformPromiseMap.has(id)) {
      this.transformPromiseMap.set(
        id,
        this._transformRequest(id).finally(() => {
          this.transformPromiseMap.delete(id);
        })
      );
    }
    return this.transformPromiseMap.get(id);
  }
  getTransformMode(id) {
    var _a, _b, _c, _d;
    const withoutQuery = id.split("?")[0];
    if ((_b = (_a = this.options.transformMode) == null ? void 0 : _a.web) == null ? void 0 : _b.some((r) => withoutQuery.match(r)))
      return "web";
    if ((_d = (_c = this.options.transformMode) == null ? void 0 : _c.ssr) == null ? void 0 : _d.some((r) => withoutQuery.match(r)))
      return "ssr";
    if (withoutQuery.match(/\.([cm]?[jt]sx?|json)$/))
      return "ssr";
    return "web";
  }
  async _fetchModule(id) {
    var _a;
    let result;
    const filePath = utils.toFilePath(id, this.server.config.root);
    const module = this.server.moduleGraph.getModuleById(id);
    const timestamp = module ? module.lastHMRTimestamp : null;
    const cache = this.fetchCache.get(filePath);
    if (timestamp !== null && cache && cache.timestamp >= timestamp)
      return cache.result;
    const time = Date.now();
    const externalize = await this.shouldExternalize(filePath);
    let duration;
    if (externalize) {
      result = { externalize };
      (_a = this.debugger) == null ? void 0 : _a.recordExternalize(id, externalize);
    } else {
      const start = perf_hooks.performance.now();
      const r = await this._transformRequest(id);
      duration = perf_hooks.performance.now() - start;
      result = { code: r == null ? void 0 : r.code, map: r == null ? void 0 : r.map };
    }
    this.fetchCache.set(filePath, {
      duration,
      timestamp: time,
      result
    });
    return result;
  }
  async _transformRequest(id) {
    var _a, _b, _c, _d;
    debugRequest(id);
    let result = null;
    if ((_a = this.options.debug) == null ? void 0 : _a.loadDumppedModules) {
      result = await ((_b = this.debugger) == null ? void 0 : _b.loadDump(id)) ?? null;
      if (result)
        return result;
    }
    if (this.getTransformMode(id) === "web") {
      result = await this.server.transformRequest(id);
      if (result)
        result = await this.server.ssrTransform(result.code, result.map, id);
    } else {
      result = await this.server.transformRequest(id, { ssr: true });
    }
    const sourcemap = this.options.sourcemap ?? "inline";
    if (sourcemap === "inline" && result && !id.includes("node_modules"))
      sourceMap.withInlineSourcemap(result);
    if ((_c = this.options.debug) == null ? void 0 : _c.dumpModules)
      await ((_d = this.debugger) == null ? void 0 : _d.dumpFile(id, result));
    return result;
  }
}

exports.ViteNodeServer = ViteNodeServer;
exports.guessCJSversion = guessCJSversion;
exports.shouldExternalize = shouldExternalize;
