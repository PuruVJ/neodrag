import { relative } from 'node:path';
import { i as isNode, a as isBrowser, r as relative$1, p as picocolors, E as EXIT_CODE_RESTART } from './chunk-utils-env.4afc6329.js';
import { isPackageExists } from 'local-pkg';

const TYPECHECK_SUITE = Symbol("vitest:typecheck-suite");

const RealDate = Date;
let now = null;
class MockDate extends RealDate {
  constructor(y, m, d, h, M, s, ms) {
    super();
    let date;
    switch (arguments.length) {
      case 0:
        if (now !== null)
          date = new RealDate(now.valueOf());
        else
          date = new RealDate();
        break;
      case 1:
        date = new RealDate(y);
        break;
      default:
        d = typeof d === "undefined" ? 1 : d;
        h = h || 0;
        M = M || 0;
        s = s || 0;
        ms = ms || 0;
        date = new RealDate(y, m, d, h, M, s, ms);
        break;
    }
    return date;
  }
}
MockDate.UTC = RealDate.UTC;
MockDate.now = function() {
  return new MockDate().valueOf();
};
MockDate.parse = function(dateString) {
  return RealDate.parse(dateString);
};
MockDate.toString = function() {
  return RealDate.toString();
};
function mockDate(date) {
  const dateObj = new RealDate(date.valueOf());
  if (isNaN(dateObj.getTime()))
    throw new TypeError(`mockdate: The time set is an invalid date: ${date}`);
  globalThis.Date = MockDate;
  now = dateObj.valueOf();
}
function resetDate() {
  globalThis.Date = RealDate;
}

function isFinalObj(obj) {
  return obj === Object.prototype || obj === Function.prototype || obj === RegExp.prototype;
}
function collectOwnProperties(obj, collector) {
  const collect = typeof collector === "function" ? collector : (key) => collector.add(key);
  Object.getOwnPropertyNames(obj).forEach(collect);
  Object.getOwnPropertySymbols(obj).forEach(collect);
}
function getAllMockableProperties(obj) {
  const allProps = /* @__PURE__ */ new Set();
  let curr = obj;
  do {
    if (isFinalObj(curr))
      break;
    collectOwnProperties(curr, (key) => {
      const descriptor = Object.getOwnPropertyDescriptor(curr, key);
      if (descriptor)
        allProps.add({ key, descriptor });
    });
  } while (curr = Object.getPrototypeOf(curr));
  return Array.from(allProps);
}
function notNullish(v) {
  return v != null;
}
function slash(str) {
  return str.replace(/\\/g, "/");
}
const noop = () => {
};
function getType(value) {
  return Object.prototype.toString.apply(value).slice(8, -1);
}
function getOwnProperties(obj) {
  const ownProps = /* @__PURE__ */ new Set();
  if (isFinalObj(obj))
    return [];
  collectOwnProperties(obj, ownProps);
  return Array.from(ownProps);
}
function deepClone(val) {
  const seen = /* @__PURE__ */ new WeakMap();
  return clone(val, seen);
}
function clone(val, seen) {
  let k, out;
  if (seen.has(val))
    return seen.get(val);
  if (Array.isArray(val)) {
    out = Array(k = val.length);
    seen.set(val, out);
    while (k--)
      out[k] = clone(val[k], seen);
    return out;
  }
  if (Object.prototype.toString.call(val) === "[object Object]") {
    out = Object.create(Object.getPrototypeOf(val));
    seen.set(val, out);
    const props = getOwnProperties(val);
    for (const k2 of props)
      out[k2] = clone(val[k2], seen);
    return out;
  }
  return val;
}
function toArray(array) {
  if (array === null || array === void 0)
    array = [];
  if (Array.isArray(array))
    return array;
  return [array];
}
const toString = (v) => Object.prototype.toString.call(v);
const isPlainObject = (val) => toString(val) === "[object Object]" && (!val.constructor || val.constructor.name === "Object");
function isObject(item) {
  return item != null && typeof item === "object" && !Array.isArray(item);
}
function deepMerge(target, ...sources) {
  if (!sources.length)
    return target;
  const source = sources.shift();
  if (source === void 0)
    return target;
  if (isMergeableObject(target) && isMergeableObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isMergeableObject(source[key])) {
        if (!target[key])
          target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
  }
  return deepMerge(target, ...sources);
}
function isMergeableObject(item) {
  return isPlainObject(item) && !Array.isArray(item);
}
function assertTypes(value, name, types) {
  const receivedType = typeof value;
  const pass = types.includes(receivedType);
  if (!pass)
    throw new TypeError(`${name} value must be ${types.join(" or ")}, received "${receivedType}"`);
}
function stdout() {
  return console._stdout || process.stdout;
}
function random(seed) {
  const x = Math.sin(seed++) * 1e4;
  return x - Math.floor(x);
}
function shuffle(array, seed = RealDate.now()) {
  let length = array.length;
  while (length) {
    const index = Math.floor(random(seed) * length--);
    const previous = array[length];
    array[length] = array[index];
    array[index] = previous;
    ++seed;
  }
  return array;
}

function isAtomTest(s) {
  return s.type === "test" || s.type === "benchmark" || s.type === "typecheck";
}
function getTests(suite) {
  return toArray(suite).flatMap((s) => isAtomTest(s) ? [s] : s.tasks.flatMap((c) => isAtomTest(c) ? [c] : getTests(c)));
}
function isTypecheckTest(suite) {
  return TYPECHECK_SUITE in suite;
}
function getTypecheckTests(suite) {
  return toArray(suite).flatMap((s) => {
    if (s.type !== "suite")
      return [];
    return TYPECHECK_SUITE in s ? [s, ...getTypecheckTests(s.tasks)] : getTypecheckTests(s.tasks);
  });
}
function getSuites(suite) {
  return toArray(suite).flatMap((s) => s.type === "suite" ? [s, ...getSuites(s.tasks)] : []);
}
function hasTests(suite) {
  return toArray(suite).some((s) => s.tasks.some((c) => isAtomTest(c) || hasTests(c)));
}
function hasFailed(suite) {
  return toArray(suite).some((s) => {
    var _a;
    return ((_a = s.result) == null ? void 0 : _a.state) === "fail" || s.type === "suite" && hasFailed(s.tasks);
  });
}
function hasFailedSnapshot(suite) {
  return getTests(suite).some((s) => {
    var _a, _b;
    const message = (_b = (_a = s.result) == null ? void 0 : _a.error) == null ? void 0 : _b.message;
    return message == null ? void 0 : message.match(/Snapshot .* mismatched/);
  });
}
function getNames(task) {
  const names = [task.name];
  let current = task;
  while ((current == null ? void 0 : current.suite) || (current == null ? void 0 : current.file)) {
    current = current.suite || current.file;
    if (current == null ? void 0 : current.name)
      names.unshift(current.name);
  }
  return names;
}

function getWorkerState() {
  return globalThis.__vitest_worker__;
}
function getCurrentEnvironment() {
  return globalThis.__vitest_environment__;
}

const isWindows = isNode && process.platform === "win32";
const getRunMode = () => getWorkerState().config.mode;
const isRunningInTest = () => getRunMode() === "test";
const isRunningInBenchmark = () => getRunMode() === "benchmark";
const relativePath = isBrowser ? relative : relative$1;
function partitionSuiteChildren(suite) {
  let tasksGroup = [];
  const tasksGroups = [];
  for (const c2 of suite.tasks) {
    if (tasksGroup.length === 0 || c2.concurrent === tasksGroup[0].concurrent) {
      tasksGroup.push(c2);
    } else {
      tasksGroups.push(tasksGroup);
      tasksGroup = [c2];
    }
  }
  if (tasksGroup.length > 0)
    tasksGroups.push(tasksGroup);
  return tasksGroups;
}
function resetModules(modules, resetMocks = false) {
  const skipPaths = [
    /\/vitest\/dist\//,
    /\/vite-node\/dist\//,
    /vitest-virtual-\w+\/dist/,
    /@vitest\/dist/,
    ...!resetMocks ? [/^mock:/] : []
  ];
  modules.forEach((_, path) => {
    if (skipPaths.some((re) => re.test(path)))
      return;
    modules.delete(path);
  });
}
function getFullName(task) {
  return getNames(task).join(picocolors.exports.dim(" > "));
}
function removeUndefinedValues(obj) {
  for (const key in Object.keys(obj)) {
    if (obj[key] === void 0)
      delete obj[key];
  }
  return obj;
}
async function ensurePackageInstalled(dependency, root) {
  if (isPackageExists(dependency, { paths: [root] }))
    return true;
  const promptInstall = !process.env.CI && process.stdout.isTTY;
  process.stderr.write(picocolors.exports.red(`${picocolors.exports.inverse(picocolors.exports.red(" MISSING DEP "))} Can not find dependency '${dependency}'

`));
  if (!promptInstall)
    return false;
  const prompts = await import('./vendor-index.9f20a9be.js').then(function (n) { return n.i; });
  const { install } = await prompts.prompt({
    type: "confirm",
    name: "install",
    message: picocolors.exports.reset(`Do you want to install ${picocolors.exports.green(dependency)}?`)
  });
  if (install) {
    await (await import('./chunk-install-pkg.31846bc1.js')).installPackage(dependency, { dev: true });
    process.stderr.write(picocolors.exports.yellow(`
Package ${dependency} installed, re-run the command to start.
`));
    process.exit(EXIT_CODE_RESTART);
    return true;
  }
  return false;
}
function getCallLastIndex(code) {
  let charIndex = -1;
  let inString = null;
  let startedBracers = 0;
  let endedBracers = 0;
  let beforeChar = null;
  while (charIndex <= code.length) {
    beforeChar = code[charIndex];
    charIndex++;
    const char = code[charIndex];
    const isCharString = char === '"' || char === "'" || char === "`";
    if (isCharString && beforeChar !== "\\") {
      if (inString === char)
        inString = null;
      else if (!inString)
        inString = char;
    }
    if (!inString) {
      if (char === "(")
        startedBracers++;
      if (char === ")")
        endedBracers++;
    }
    if (startedBracers && endedBracers && startedBracers === endedBracers)
      return charIndex;
  }
  return null;
}
isNode ? relative$1 : relative;
class AggregateErrorPonyfill extends Error {
  constructor(errors, message = "") {
    super(message);
    this.errors = [...errors];
  }
}
function createDefer() {
  let resolve2 = null;
  let reject = null;
  const p = new Promise((_resolve, _reject) => {
    resolve2 = _resolve;
    reject = _reject;
  });
  p.resolve = resolve2;
  p.reject = reject;
  return p;
}
function objectAttr(source, path, defaultValue = void 0) {
  const paths = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let result = source;
  for (const p of paths) {
    result = Object(result)[p];
    if (result === void 0)
      return defaultValue;
  }
  return result;
}

export { AggregateErrorPonyfill as A, getTests as B, hasFailedSnapshot as C, getTypecheckTests as D, getSuites as E, isTypecheckTest as F, deepMerge as G, removeUndefinedValues as H, isWindows as I, stdout as J, getAllMockableProperties as K, RealDate as R, TYPECHECK_SUITE as T, resetModules as a, getCallLastIndex as b, getNames as c, assertTypes as d, getCurrentEnvironment as e, getFullName as f, getWorkerState as g, isRunningInTest as h, isObject as i, isRunningInBenchmark as j, notNullish as k, relativePath as l, mockDate as m, noop as n, objectAttr as o, partitionSuiteChildren as p, shuffle as q, resetDate as r, slash as s, toArray as t, hasTests as u, hasFailed as v, createDefer as w, deepClone as x, getType as y, ensurePackageInstalled as z };
