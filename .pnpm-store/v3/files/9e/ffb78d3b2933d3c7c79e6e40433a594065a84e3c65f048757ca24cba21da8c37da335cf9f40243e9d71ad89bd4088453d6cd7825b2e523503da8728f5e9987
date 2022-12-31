'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
function sum(...args) {
  return flattenArrayable(args).reduce((a, b) => a + b, 0);
}

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
function sample(arr, count) {
  return Array.from({ length: count }, (_) => arr[Math.round(Math.random() * (arr.length - 1))]);
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const assert = (condition, message) => {
  if (!condition)
    throw new Error(message);
};
const toString = (v) => Object.prototype.toString.call(v);
const noop = () => {
};

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

const isDef = (val) => typeof val !== "undefined";
const isBoolean = (val) => typeof val === "boolean";
const isFunction = (val) => typeof val === "function";
const isNumber = (val) => typeof val === "number";
const isString = (val) => typeof val === "string";
const isObject = (val) => toString(val) === "[object Object]";
const isWindow = (val) => typeof window !== "undefined" && toString(val) === "[object Window]";
const isBrowser = typeof window !== "undefined";

function slash(str) {
  return str.replace(/\\/g, "/");
}
function ensurePrefix(prefix, str) {
  if (!str.startsWith(prefix))
    return prefix + str;
  return str;
}
function ensureSuffix(suffix, str) {
  if (!str.endsWith(suffix))
    return str + suffix;
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
const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function randomStr(size = 16, dict = urlAlphabet) {
  let id = "";
  let i = size;
  const len = dict.length;
  while (i--)
    id += dict[Math.random() * len | 0];
  return id;
}

const timestamp = () => +Date.now();

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
      if (!omitUndefined || obj[k] !== void 0)
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
function createControlledPromise() {
  let resolve, reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}

/* eslint-disable no-undefined,no-param-reassign,no-shadow */

/**
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 *
 * @param  {number}    delay -          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param  {boolean}   [noTrailing] -   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
 *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
 *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
 *                                    the internal counter is reset).
 * @param  {Function}  callback -       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                    to `callback` when the throttled-function is executed.
 * @param  {boolean}   [debounceMode] - If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
 *                                    schedule `callback` to execute after `delay` ms.
 *
 * @returns {Function}  A new, throttled, function.
 */
function throttle (delay, noTrailing, callback, debounceMode) {
  /*
   * After wrapper has stopped being called, this timeout ensures that
   * `callback` is executed at the proper times in `throttle` and `end`
   * debounce modes.
   */
  var timeoutID;
  var cancelled = false; // Keep track of the last time `callback` was executed.

  var lastExec = 0; // Function to clear existing timeout

  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  } // Function to cancel next exec


  function cancel() {
    clearExistingTimeout();
    cancelled = true;
  } // `noTrailing` defaults to falsy.


  if (typeof noTrailing !== 'boolean') {
    debounceMode = callback;
    callback = noTrailing;
    noTrailing = undefined;
  }
  /*
   * The `wrapper` function encapsulates all of the throttling / debouncing
   * functionality and when executed will limit the rate at which `callback`
   * is executed.
   */


  function wrapper() {
    for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) {
      arguments_[_key] = arguments[_key];
    }

    var self = this;
    var elapsed = Date.now() - lastExec;

    if (cancelled) {
      return;
    } // Execute `callback` and update the `lastExec` timestamp.


    function exec() {
      lastExec = Date.now();
      callback.apply(self, arguments_);
    }
    /*
     * If `debounceMode` is true (at begin) this is used to clear the flag
     * to allow future `callback` executions.
     */


    function clear() {
      timeoutID = undefined;
    }

    if (debounceMode && !timeoutID) {
      /*
       * Since `wrapper` is being called for the first time and
       * `debounceMode` is true (at begin), execute `callback`.
       */
      exec();
    }

    clearExistingTimeout();

    if (debounceMode === undefined && elapsed > delay) {
      /*
       * In throttle mode, if `delay` time has been exceeded, execute
       * `callback`.
       */
      exec();
    } else if (noTrailing !== true) {
      /*
       * In trailing throttle mode, since `delay` time has not been
       * exceeded, schedule `callback` to execute `delay` ms after most
       * recent execution.
       *
       * If `debounceMode` is true (at begin), schedule `clear` to execute
       * after `delay` ms.
       *
       * If `debounceMode` is false (at end), schedule `callback` to
       * execute after `delay` ms.
       */
      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
    }
  }

  wrapper.cancel = cancel; // Return the wrapper function.

  return wrapper;
}

/* eslint-disable no-undefined */
/**
 * Debounce execution of a function. Debouncing, unlike throttling,
 * guarantees that a function is only executed a single time, either at the
 * very beginning of a series of calls, or at the very end.
 *
 * @param  {number}   delay -         A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param  {boolean}  [atBegin] -     Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds
 *                                  after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.
 *                                  (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
 * @param  {Function} callback -      A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                  to `callback` when the debounced-function is executed.
 *
 * @returns {Function} A new, debounced function.
 */

function debounce (delay, atBegin, callback) {
  return callback === undefined ? throttle(delay, atBegin, false) : throttle(delay, callback, atBegin !== false);
}

/*
How it works:
`this.#head` is an instance of `Node` which keeps track of its current value and nests another instance of `Node` that keeps the value that comes after it. When a value is provided to `.enqueue()`, the code needs to iterate through `this.#head`, going deeper and deeper to find the last value. However, iterating through every single item is slow. This problem is solved by saving a reference to the last value as `this.#tail` so that it can reference it to add a new value.
*/

class Node {
	value;
	next;

	constructor(value) {
		this.value = value;
	}
}

class Queue {
	#head;
	#tail;
	#size;

	constructor() {
		this.clear();
	}

	enqueue(value) {
		const node = new Node(value);

		if (this.#head) {
			this.#tail.next = node;
			this.#tail = node;
		} else {
			this.#head = node;
			this.#tail = node;
		}

		this.#size++;
	}

	dequeue() {
		const current = this.#head;
		if (!current) {
			return;
		}

		this.#head = this.#head.next;
		this.#size--;
		return current.value;
	}

	clear() {
		this.#head = undefined;
		this.#tail = undefined;
		this.#size = 0;
	}

	get size() {
		return this.#size;
	}

	* [Symbol.iterator]() {
		let current = this.#head;

		while (current) {
			yield current.value;
			current = current.next;
		}
	}
}

function pLimit(concurrency) {
	if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) {
		throw new TypeError('Expected `concurrency` to be a number from 1 and up');
	}

	const queue = new Queue();
	let activeCount = 0;

	const next = () => {
		activeCount--;

		if (queue.size > 0) {
			queue.dequeue()();
		}
	};

	const run = async (fn, resolve, args) => {
		activeCount++;

		const result = (async () => fn(...args))();

		resolve(result);

		try {
			await result;
		} catch {}

		next();
	};

	const enqueue = (fn, resolve, args) => {
		queue.enqueue(run.bind(undefined, fn, resolve, args));

		(async () => {
			// This function needs to wait until the next microtask before comparing
			// `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
			// when the run function is dequeued and called. The comparison in the if-statement
			// needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
			await Promise.resolve();

			if (activeCount < concurrency && queue.size > 0) {
				queue.dequeue()();
			}
		})();
	};

	const generator = (fn, ...args) => new Promise(resolve => {
		enqueue(fn, resolve, args);
	});

	Object.defineProperties(generator, {
		activeCount: {
			get: () => activeCount,
		},
		pendingCount: {
			get: () => queue.size,
		},
		clearQueue: {
			value: () => {
				queue.clear();
			},
		},
	});

	return generator;
}

const VOID = Symbol("p-void");
class PInstance extends Promise {
  constructor(items = [], options) {
    super(() => {
    });
    this.items = items;
    this.options = options;
    this.promises = /* @__PURE__ */ new Set();
  }
  get promise() {
    var _a;
    let batch;
    const items = [...Array.from(this.items), ...Array.from(this.promises)];
    if ((_a = this.options) == null ? void 0 : _a.concurrency) {
      const limit = pLimit(this.options.concurrency);
      batch = Promise.all(items.map((p2) => limit(() => p2)));
    } else {
      batch = Promise.all(items);
    }
    return batch.then((l) => l.filter((i) => i !== VOID));
  }
  add(...args) {
    args.forEach((i) => {
      this.promises.add(i);
    });
  }
  map(fn) {
    return new PInstance(Array.from(this.items).map(async (i, idx) => {
      const v = await i;
      if (v === VOID)
        return VOID;
      return fn(v, idx);
    }), this.options);
  }
  filter(fn) {
    return new PInstance(Array.from(this.items).map(async (i, idx) => {
      const v = await i;
      const r = await fn(v, idx);
      if (!r)
        return VOID;
      return v;
    }), this.options);
  }
  forEach(fn) {
    return this.map(fn).then();
  }
  reduce(fn, initialValue) {
    return this.promise.then((array) => array.reduce(fn, initialValue));
  }
  clear() {
    this.promises.clear();
  }
  then(fn) {
    const p2 = this.promise;
    if (fn)
      return p2.then(fn);
    else
      return p2;
  }
  catch(fn) {
    return this.promise.catch(fn);
  }
  finally(fn) {
    return this.promise.finally(fn);
  }
}
function p(items, options) {
  return new PInstance(items, options);
}

exports.assert = assert;
exports.at = at;
exports.batchInvoke = batchInvoke;
exports.clamp = clamp;
exports.clampArrayRange = clampArrayRange;
exports.clearUndefined = clearUndefined;
exports.createControlledPromise = createControlledPromise;
exports.createPromiseLock = createPromiseLock;
exports.createSingletonPromise = createSingletonPromise;
exports.debounce = debounce;
exports.deepMerge = deepMerge;
exports.ensurePrefix = ensurePrefix;
exports.ensureSuffix = ensureSuffix;
exports.flattenArrayable = flattenArrayable;
exports.hasOwnProperty = hasOwnProperty;
exports.invoke = invoke;
exports.isBoolean = isBoolean;
exports.isBrowser = isBrowser;
exports.isDef = isDef;
exports.isFunction = isFunction;
exports.isKeyOf = isKeyOf;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isString = isString;
exports.isTruthy = isTruthy;
exports.isWindow = isWindow;
exports.last = last;
exports.mergeArrayable = mergeArrayable;
exports.move = move;
exports.noNull = noNull;
exports.noop = noop;
exports.notNullish = notNullish;
exports.notUndefined = notUndefined;
exports.objectEntries = objectEntries;
exports.objectKeys = objectKeys;
exports.objectMap = objectMap;
exports.objectPick = objectPick;
exports.p = p;
exports.partition = partition;
exports.randomStr = randomStr;
exports.range = range;
exports.remove = remove;
exports.sample = sample;
exports.shuffle = shuffle;
exports.slash = slash;
exports.sleep = sleep;
exports.sum = sum;
exports.tap = tap;
exports.template = template;
exports.throttle = throttle;
exports.timestamp = timestamp;
exports.toArray = toArray;
exports.toString = toString;
exports.uniq = uniq;
