var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  assert: () => assert,
  at: () => at,
  batchInvoke: () => batchInvoke,
  clamp: () => clamp,
  clampArrayRange: () => clampArrayRange,
  clearUndefined: () => clearUndefined,
  createPromiseLock: () => createPromiseLock,
  createSingletonPromise: () => createSingletonPromise,
  debounce: () => debounce,
  deepMerge: () => deepMerge,
  ensurePrefix: () => ensurePrefix,
  flattenArrayable: () => flattenArrayable,
  hasOwnProperty: () => hasOwnProperty,
  invoke: () => invoke,
  isBoolean: () => isBoolean,
  isBrowser: () => isBrowser,
  isDef: () => isDef,
  isFunction: () => isFunction,
  isKeyOf: () => isKeyOf,
  isNumber: () => isNumber,
  isObject: () => isObject,
  isString: () => isString,
  isTruthy: () => isTruthy,
  isWindow: () => isWindow,
  last: () => last,
  mergeArrayable: () => mergeArrayable,
  move: () => move,
  noNull: () => noNull,
  noop: () => noop,
  notNullish: () => notNullish,
  notUndefined: () => notUndefined,
  objectEntries: () => objectEntries,
  objectKeys: () => objectKeys,
  objectMap: () => objectMap,
  objectPick: () => objectPick,
  partition: () => partition,
  range: () => range,
  remove: () => remove,
  slash: () => slash,
  sleep: () => sleep,
  sum: () => sum,
  tap: () => tap,
  template: () => template,
  throttle: () => throttle,
  timestamp: () => timestamp,
  toArray: () => toArray,
  toString: () => toString,
  uniq: () => uniq
});

// src/math.ts
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
function sum(...args) {
  return flattenArrayable(args).reduce((a, b) => a + b, 0);
}

// src/array.ts
function toArray(array) {
  array = array || [];
  if (Array.isArray(array))
    return array;
  return [array];
}
function flattenArrayable(array) {
  return toArray(array).flat(1);
}
function mergeArrayable(...args) {
  return args.flatMap((i) => toArray(i));
}
function partition(array, ...filters) {
  const result = new Array(filters.length + 1).fill(null).map(() => []);
  array.forEach((e, idx, arr) => {
    let i = 0;
    for (const filter of filters) {
      if (filter(e, idx, arr)) {
        result[i].push(e);
        return;
      }
      i += 1;
    }
    result[i].push(e);
  });
  return result;
}
function uniq(array) {
  return Array.from(new Set(array));
}
function last(array) {
  return at(array, -1);
}
function remove(array, value) {
  if (!array)
    return false;
  const index = array.indexOf(value);
  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }
  return false;
}
function at(array, index) {
  const len = array.length;
  if (!len)
    return void 0;
  if (index < 0)
    index += len;
  return array[index];
}
function range(...args) {
  let start, stop, step;
  if (args.length === 1) {
    start = 0;
    step = 1;
    [stop] = args;
  } else {
    [start, stop, step = 1] = args;
  }
  const arr = [];
  let current = start;
  while (current < stop) {
    arr.push(current);
    current += step || 1;
  }
  return arr;
}
function move(arr, from, to) {
  arr.splice(to, 0, arr.splice(from, 1)[0]);
  return arr;
}
function clampArrayRange(n, arr) {
  return clamp(n, 0, arr.length - 1);
}

// src/base.ts
var assert = (condition, message) => {
  if (!condition)
    throw new Error(message);
};
var toString = (v) => Object.prototype.toString.call(v);
var noop = () => {
};

// src/guards.ts
function notNullish(v) {
  return v != null;
}
function noNull(v) {
  return v !== null;
}
function notUndefined(v) {
  return v !== void 0;
}
function isTruthy(v) {
  return Boolean(v);
}

// src/is.ts
var isDef = (val) => typeof val !== "undefined";
var isBoolean = (val) => typeof val === "boolean";
var isFunction = (val) => typeof val === "function";
var isNumber = (val) => typeof val === "number";
var isString = (val) => typeof val === "string";
var isObject = (val) => toString(val) === "[object Object]";
var isWindow = (val) => typeof window !== "undefined" && toString(val) === "[object Window]";
var isBrowser = typeof window !== "undefined";

// src/string.ts
function slash(str) {
  return str.replace(/\\/g, "/");
}
function ensurePrefix(prefix, str) {
  if (!str.startsWith(prefix))
    return prefix + str;
  return str;
}
function template(str, ...args) {
  return str.replace(/{(\d+)}/g, (match, key) => {
    const index = Number(key);
    if (Number.isNaN(index))
      return match;
    return args[index];
  });
}

// src/time.ts
var timestamp = () => +Date.now();

// src/function.ts
function batchInvoke(functions) {
  functions.forEach((fn) => fn && fn());
}
function invoke(fn) {
  return fn();
}
function tap(value, callback) {
  callback(value);
  return value;
}

// src/object.ts
function objectMap(obj, fn) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => fn(k, v)).filter(notNullish));
}
function isKeyOf(obj, k) {
  return k in obj;
}
function objectKeys(obj) {
  return Object.keys(obj);
}
function objectEntries(obj) {
  return Object.entries(obj);
}
function deepMerge(target, ...sources) {
  if (!sources.length)
    return target;
  const source = sources.shift();
  if (source === void 0)
    return target;
  if (isMergableObject(target) && isMergableObject(source)) {
    objectKeys(source).forEach((key) => {
      if (isMergableObject(source[key])) {
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
function isMergableObject(item) {
  return isObject(item) && !Array.isArray(item);
}
function objectPick(obj, keys, omitUndefined = false) {
  return keys.reduce((n, k) => {
    if (k in obj) {
      if (!omitUndefined || !obj[k] === void 0)
        n[k] = obj[k];
    }
    return n;
  }, {});
}
function clearUndefined(obj) {
  Object.keys(obj).forEach((key) => obj[key] === void 0 ? delete obj[key] : {});
  return obj;
}
function hasOwnProperty(obj, v) {
  if (obj == null)
    return false;
  return Object.prototype.hasOwnProperty.call(obj, v);
}

// src/promise.ts
function createSingletonPromise(fn) {
  let _promise;
  function wrapper() {
    if (!_promise)
      _promise = fn();
    return _promise;
  }
  wrapper.reset = async () => {
    const _prev = _promise;
    _promise = void 0;
    if (_prev)
      await _prev;
  };
  return wrapper;
}
function sleep(ms, callback) {
  return new Promise((resolve) => setTimeout(async () => {
    await (callback == null ? void 0 : callback());
    resolve();
  }, ms));
}
function createPromiseLock() {
  const locks = [];
  return {
    async run(fn) {
      const p = fn();
      locks.push(p);
      try {
        return await p;
      } finally {
        remove(locks, p);
      }
    },
    async wait() {
      await Promise.allSettled(locks);
    },
    isWaiting() {
      return Boolean(locks.length);
    },
    clear() {
      locks.length = 0;
    }
  };
}

// node_modules/.pnpm/throttle-debounce@3.0.1/node_modules/throttle-debounce/esm/index.js
function throttle(delay, noTrailing, callback, debounceMode) {
  var timeoutID;
  var cancelled = false;
  var lastExec = 0;
  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  }
  function cancel() {
    clearExistingTimeout();
    cancelled = true;
  }
  if (typeof noTrailing !== "boolean") {
    debounceMode = callback;
    callback = noTrailing;
    noTrailing = void 0;
  }
  function wrapper() {
    for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) {
      arguments_[_key] = arguments[_key];
    }
    var self = this;
    var elapsed = Date.now() - lastExec;
    if (cancelled) {
      return;
    }
    function exec() {
      lastExec = Date.now();
      callback.apply(self, arguments_);
    }
    function clear() {
      timeoutID = void 0;
    }
    if (debounceMode && !timeoutID) {
      exec();
    }
    clearExistingTimeout();
    if (debounceMode === void 0 && elapsed > delay) {
      exec();
    } else if (noTrailing !== true) {
      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === void 0 ? delay - elapsed : delay);
    }
  }
  wrapper.cancel = cancel;
  return wrapper;
}
function debounce(delay, atBegin, callback) {
  return callback === void 0 ? throttle(delay, atBegin, false) : throttle(delay, callback, atBegin !== false);
}
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assert,
  at,
  batchInvoke,
  clamp,
  clampArrayRange,
  clearUndefined,
  createPromiseLock,
  createSingletonPromise,
  debounce,
  deepMerge,
  ensurePrefix,
  flattenArrayable,
  hasOwnProperty,
  invoke,
  isBoolean,
  isBrowser,
  isDef,
  isFunction,
  isKeyOf,
  isNumber,
  isObject,
  isString,
  isTruthy,
  isWindow,
  last,
  mergeArrayable,
  move,
  noNull,
  noop,
  notNullish,
  notUndefined,
  objectEntries,
  objectKeys,
  objectMap,
  objectPick,
  partition,
  range,
  remove,
  slash,
  sleep,
  sum,
  tap,
  template,
  throttle,
  timestamp,
  toArray,
  toString,
  uniq
});
