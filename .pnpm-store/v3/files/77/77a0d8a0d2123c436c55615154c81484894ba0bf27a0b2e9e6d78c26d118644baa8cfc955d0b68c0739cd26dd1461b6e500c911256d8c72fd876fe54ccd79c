import { ViteNodeRunner } from 'vite-node/client';
import { isInternalRequest } from 'vite-node/utils';
import { normalizePath } from 'vite';
import { i as isNodeBuiltin } from './vendor-index.2e96c50b.js';
import { g as getWorkerState, y as getType, K as getAllMockableProperties, e as getCurrentEnvironment } from './chunk-typecheck-constants.e478eb98.js';
import { existsSync, readdirSync } from 'node:fs';
import { b as resolve, e as distDir, g as isAbsolute, p as picocolors, d as dirname, j as join, c as basename, l as extname } from './chunk-utils-env.4afc6329.js';

class RefTracker {
  constructor() {
    this.idMap = /* @__PURE__ */ new Map();
    this.mockedValueMap = /* @__PURE__ */ new Map();
  }
  getId(value) {
    return this.idMap.get(value);
  }
  getMockedValue(id) {
    return this.mockedValueMap.get(id);
  }
  track(originalValue, mockedValue) {
    const newId = this.idMap.size;
    this.idMap.set(originalValue, newId);
    this.mockedValueMap.set(newId, mockedValue);
    return newId;
  }
}
function isSpecialProp(prop, parentType) {
  return parentType.includes("Function") && typeof prop === "string" && ["arguments", "callee", "caller", "length", "name"].includes(prop);
}
const _VitestMocker = class {
  constructor(runner) {
    this.runner = runner;
    this.resolveCache = /* @__PURE__ */ new Map();
  }
  get root() {
    return this.runner.options.root;
  }
  get base() {
    return this.runner.options.base;
  }
  get mockMap() {
    return this.runner.options.mockMap;
  }
  get moduleCache() {
    return this.runner.moduleCache;
  }
  getSuiteFilepath() {
    return getWorkerState().filepath || "global";
  }
  getMocks() {
    const suite = this.getSuiteFilepath();
    const suiteMocks = this.mockMap.get(suite);
    const globalMocks = this.mockMap.get("global");
    return {
      ...globalMocks,
      ...suiteMocks
    };
  }
  async resolvePath(rawId, importer) {
    const [id, fsPath] = await this.runner.resolveUrl(rawId, importer);
    const external = !isAbsolute(fsPath) || fsPath.includes("/node_modules/") ? rawId : null;
    return {
      id,
      fsPath,
      external
    };
  }
  async resolveMocks() {
    await Promise.all(_VitestMocker.pendingIds.map(async (mock) => {
      const { fsPath, external } = await this.resolvePath(mock.id, mock.importer);
      if (mock.type === "unmock")
        this.unmockPath(fsPath);
      if (mock.type === "mock")
        this.mockPath(mock.id, fsPath, external, mock.factory);
    }));
    _VitestMocker.pendingIds = [];
  }
  async callFunctionMock(dep, mock) {
    var _a, _b;
    const cached = (_a = this.moduleCache.get(dep)) == null ? void 0 : _a.exports;
    if (cached)
      return cached;
    let exports;
    try {
      exports = await mock();
    } catch (err) {
      const vitestError = new Error(
        '[vitest] There was an error, when mocking a module. If you are using "vi.mock" factory, make sure there are no top level variables inside, since this call is hoisted to top of the file. Read more: https://vitest.dev/api/#vi-mock'
      );
      vitestError.cause = err;
      throw vitestError;
    }
    const filepath = dep.slice(5);
    const mockpath = ((_b = this.resolveCache.get(this.getSuiteFilepath())) == null ? void 0 : _b[filepath]) || filepath;
    if (exports === null || typeof exports !== "object")
      throw new Error(`[vitest] vi.mock("${mockpath}", factory?: () => unknown) is not returning an object. Did you mean to return an object with a "default" key?`);
    const moduleExports = new Proxy(exports, {
      get(target, prop) {
        const val = target[prop];
        if (prop === "then") {
          if (target instanceof Promise)
            return target.then.bind(target);
        } else if (!(prop in target)) {
          throw new Error(
            `[vitest] No "${String(prop)}" export is defined on the "${mockpath}" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "vi.importActual" inside:

${picocolors.exports.green(`vi.mock("${mockpath}", async () => {
  const actual = await vi.importActual("${mockpath}")
  return {
    ...actual,
    // your mocked methods
  },
})`)}
`
          );
        }
        return val;
      }
    });
    this.moduleCache.set(dep, { exports: moduleExports });
    return moduleExports;
  }
  getMockPath(dep) {
    return `mock:${dep}`;
  }
  getDependencyMock(id) {
    return this.getMocks()[id];
  }
  normalizePath(path) {
    return this.moduleCache.normalizePath(path);
  }
  resolveMockPath(mockPath, external) {
    const path = external || mockPath;
    if (external || isNodeBuiltin(mockPath) || !existsSync(mockPath)) {
      const mockDirname = dirname(path);
      const mockFolder = join(this.root, "__mocks__", mockDirname);
      if (!existsSync(mockFolder))
        return null;
      const files = readdirSync(mockFolder);
      const baseOriginal = basename(path);
      for (const file of files) {
        const baseFile = basename(file, extname(file));
        if (baseFile === baseOriginal)
          return resolve(mockFolder, file);
      }
      return null;
    }
    const dir = dirname(path);
    const baseId = basename(path);
    const fullPath = resolve(dir, "__mocks__", baseId);
    return existsSync(fullPath) ? fullPath : null;
  }
  mockObject(object, mockExports = {}) {
    if (!_VitestMocker.spyModule) {
      throw new Error(
        "Error: Spy module is not defined. This is likely an internal bug in Vitest. Please report it to https://github.com/vitest-dev/vitest/issues"
      );
    }
    const spyModule = _VitestMocker.spyModule;
    const finalizers = new Array();
    const refs = new RefTracker();
    const define = (container, key, value) => {
      try {
        container[key] = value;
        return true;
      } catch {
        return false;
      }
    };
    const mockPropertiesOf = (container, newContainer) => {
      const containerType = getType(container);
      const isModule = containerType === "Module" || !!container.__esModule;
      for (const { key: property, descriptor } of getAllMockableProperties(container)) {
        if (!isModule && descriptor.get) {
          try {
            Object.defineProperty(newContainer, property, descriptor);
          } catch (error) {
          }
          continue;
        }
        if (isSpecialProp(property, containerType))
          continue;
        const value = container[property];
        const refId = refs.getId(value);
        if (refId !== void 0) {
          finalizers.push(() => define(newContainer, property, refs.getMockedValue(refId)));
          continue;
        }
        const type = getType(value);
        if (Array.isArray(value)) {
          define(newContainer, property, []);
          continue;
        }
        const isFunction = type.includes("Function") && typeof value === "function";
        if ((!isFunction || value.__isMockFunction) && type !== "Object" && type !== "Module") {
          define(newContainer, property, value);
          continue;
        }
        if (!define(newContainer, property, isFunction ? value : {}))
          continue;
        if (isFunction) {
          spyModule.spyOn(newContainer, property).mockImplementation(() => void 0);
          Object.defineProperty(newContainer[property], "length", { value: 0 });
        }
        refs.track(value, newContainer[property]);
        mockPropertiesOf(value, newContainer[property]);
      }
    };
    const mockedObject = mockExports;
    mockPropertiesOf(object, mockedObject);
    for (const finalizer of finalizers)
      finalizer();
    return mockedObject;
  }
  unmockPath(path) {
    const suitefile = this.getSuiteFilepath();
    const id = this.normalizePath(path);
    const mock = this.mockMap.get(suitefile);
    if (mock && id in mock)
      delete mock[id];
    const mockId = this.getMockPath(id);
    if (this.moduleCache.get(mockId))
      this.moduleCache.delete(mockId);
  }
  mockPath(originalId, path, external, factory) {
    const suitefile = this.getSuiteFilepath();
    const id = this.normalizePath(path);
    const mocks = this.mockMap.get(suitefile) || {};
    const resolves = this.resolveCache.get(suitefile) || {};
    mocks[id] = factory || this.resolveMockPath(path, external);
    resolves[id] = originalId;
    this.mockMap.set(suitefile, mocks);
    this.resolveCache.set(suitefile, resolves);
  }
  async importActual(rawId, importee) {
    const { id, fsPath } = await this.resolvePath(rawId, importee);
    const result = await this.runner.cachedRequest(id, fsPath, [importee]);
    return result;
  }
  async importMock(rawId, importee) {
    const { id, fsPath, external } = await this.resolvePath(rawId, importee);
    const normalizedId = this.normalizePath(fsPath);
    let mock = this.getDependencyMock(normalizedId);
    if (mock === void 0)
      mock = this.resolveMockPath(fsPath, external);
    if (mock === null) {
      const mod = await this.runner.cachedRequest(id, fsPath, [importee]);
      return this.mockObject(mod);
    }
    if (typeof mock === "function")
      return this.callFunctionMock(fsPath, mock);
    return this.runner.dependencyRequest(mock, mock, [importee]);
  }
  async initializeSpyModule() {
    if (_VitestMocker.spyModule)
      return;
    _VitestMocker.spyModule = await this.runner.executeId(_VitestMocker.spyModulePath);
  }
  async requestWithMock(url, callstack) {
    if (_VitestMocker.pendingIds.length)
      await this.resolveMocks();
    const id = this.normalizePath(url);
    const mock = this.getDependencyMock(id);
    const mockPath = this.getMockPath(id);
    if (mock === null) {
      const cache = this.moduleCache.get(mockPath);
      if (cache == null ? void 0 : cache.exports)
        return cache.exports;
      const exports = {};
      this.moduleCache.set(mockPath, { exports });
      const mod = await this.runner.directRequest(url, url, []);
      this.mockObject(mod, exports);
      return exports;
    }
    if (typeof mock === "function" && !callstack.includes(mockPath) && !callstack.includes(url)) {
      callstack.push(mockPath);
      const result = await this.callFunctionMock(mockPath, mock);
      const indexMock = callstack.indexOf(mockPath);
      callstack.splice(indexMock, 1);
      return result;
    }
    if (typeof mock === "string" && !callstack.includes(mock))
      url = mock;
    return url;
  }
  queueMock(id, importer, factory) {
    _VitestMocker.pendingIds.push({ type: "mock", id, importer, factory });
  }
  queueUnmock(id, importer) {
    _VitestMocker.pendingIds.push({ type: "unmock", id, importer });
  }
};
let VitestMocker = _VitestMocker;
VitestMocker.pendingIds = [];
VitestMocker.spyModulePath = resolve(distDir, "spy.js");

async function executeInViteNode(options) {
  const runner = new VitestRunner(options);
  await runner.executeId("/@vite/env");
  await runner.mocker.initializeSpyModule();
  const result = [];
  for (const file of options.files)
    result.push(await runner.executeFile(file));
  return result;
}
class VitestRunner extends ViteNodeRunner {
  constructor(options) {
    super(options);
    this.options = options;
    this.mocker = new VitestMocker(this);
  }
  shouldResolveId(id, _importee) {
    if (isInternalRequest(id))
      return false;
    const environment = getCurrentEnvironment();
    return environment === "node" ? !isNodeBuiltin(id) : true;
  }
  async resolveUrl(id, importee) {
    if (importee && importee.startsWith("mock:"))
      importee = importee.slice(5);
    return super.resolveUrl(id, importee);
  }
  async dependencyRequest(id, fsPath, callstack) {
    const mocked = await this.mocker.requestWithMock(fsPath, callstack);
    if (typeof mocked === "string")
      return super.dependencyRequest(mocked, mocked, callstack);
    if (mocked && typeof mocked === "object")
      return mocked;
    return super.dependencyRequest(id, fsPath, callstack);
  }
  prepareContext(context) {
    const workerState = getWorkerState();
    if (workerState.filepath && normalizePath(workerState.filepath) === normalizePath(context.__filename)) {
      Object.defineProperty(context.__vite_ssr_import_meta__, "vitest", { get: () => globalThis.__vitest_index__ });
    }
    return Object.assign(context, {
      __vitest_mocker__: this.mocker
    });
  }
  shouldInterop(path, mod) {
    return this.options.interopDefault ?? (getCurrentEnvironment() !== "node" && super.shouldInterop(path, mod));
  }
}

export { VitestRunner as V, executeInViteNode as e };
