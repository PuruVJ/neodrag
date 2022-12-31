export { debounce, throttle } from 'throttle-debounce';

/**
 * Promise, or maybe not
 */
declare type Awaitable<T> = T | PromiseLike<T>;
/**
 * Null or whatever
 */
declare type Nullable<T> = T | null | undefined;
/**
 * Array, or not yet
 */
declare type Arrayable<T> = T | Array<T>;
/**
 * Function
 */
declare type Fn<T = void> = () => T;
/**
 * Constructor
 */
declare type Constructor<T = void> = new (...args: any[]) => T;
/**
 * Infers the element type of an array
 */
declare type ElementOf<T> = T extends (infer E)[] ? E : never;
/**
 * Defines an intersection type of all union items.
 *
 * @param U Union of any types that will be intersected.
 * @returns U items intersected
 * @see https://stackoverflow.com/a/50375286/9259330
 */
declare type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
/**
 * Infers the arguments type of a function
 */
declare type ArgumentsType<T> = T extends ((...args: infer A) => any) ? A : never;
declare type MergeInsertions<T> = T extends object ? {
    [K in keyof T]: MergeInsertions<T[K]>;
} : T;
declare type DeepMerge<F, S> = MergeInsertions<{
    [K in keyof F | keyof S]: K extends keyof S & keyof F ? DeepMerge<F[K], S[K]> : K extends keyof S ? S[K] : K extends keyof F ? F[K] : never;
}>;

/**
 * Convert `Arrayable<T>` to `Array<T>`
 *
 * @category Array
 */
declare function toArray<T>(array?: Nullable<Arrayable<T>>): Array<T>;
/**
 * Convert `Arrayable<T>` to `Array<T>` and flatten it
 *
 * @category Array
 */
declare function flattenArrayable<T>(array?: Nullable<Arrayable<T | Array<T>>>): Array<T>;
/**
 * Use rest arguments to merge arrays
 *
 * @category Array
 */
declare function mergeArrayable<T>(...args: Nullable<Arrayable<T>>[]): Array<T>;
declare type PartitionFilter<T> = (i: T, idx: number, arr: readonly T[]) => any;
/**
 * Divide an array into two parts by a filter function
 *
 * @category Array
 * @example const [odd, even] = partition([1, 2, 3, 4], i => i % 2 != 0)
 */
declare function partition<T>(array: readonly T[], f1: PartitionFilter<T>): [T[], T[]];
declare function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>): [T[], T[], T[]];
declare function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>, f3: PartitionFilter<T>): [T[], T[], T[], T[]];
declare function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>, f3: PartitionFilter<T>, f4: PartitionFilter<T>): [T[], T[], T[], T[], T[]];
declare function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>, f3: PartitionFilter<T>, f4: PartitionFilter<T>, f5: PartitionFilter<T>): [T[], T[], T[], T[], T[], T[]];
declare function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>, f3: PartitionFilter<T>, f4: PartitionFilter<T>, f5: PartitionFilter<T>, f6: PartitionFilter<T>): [T[], T[], T[], T[], T[], T[], T[]];
/**
 * Unique an Array
 *
 * @category Array
 */
declare function uniq<T>(array: readonly T[]): T[];
/**
 * Get last item
 *
 * @category Array
 */
declare function last(array: readonly []): undefined;
declare function last<T>(array: readonly T[]): T;
/**
 * Remove an item from Array
 *
 * @category Array
 */
declare function remove<T>(array: T[], value: T): boolean;
/**
 * Get nth item of Array. Negative for backward
 *
 * @category Array
 */
declare function at(array: readonly [], index: number): undefined;
declare function at<T>(array: readonly T[], index: number): T;
/**
 * Genrate a range array of numbers. The `stop` is exclusive.
 *
 * @category Array
 */
declare function range(stop: number): number[];
declare function range(start: number, stop: number, step?: number): number[];
/**
 * Move element in an Array
 *
 * @category Array
 * @param arr
 * @param from
 * @param to
 */
declare function move<T>(arr: T[], from: number, to: number): T[];
/**
 * Clamp a number to the index ranage of an array
 *
 * @category Array
 */
declare function clampArrayRange(n: number, arr: readonly unknown[]): number;

declare const assert: (condition: boolean, message: string) => asserts condition;
declare const toString: (v: any) => string;
declare const noop: () => void;

/**
 * Type guard to filter out null-ish values
 *
 * @category Guards
 * @example array.filter(notNullish)
 */
declare function notNullish<T>(v: T | null | undefined): v is NonNullable<T>;
/**
 * Type guard to filter out null values
 *
 * @category Guards
 * @example array.filter(noNull)
 */
declare function noNull<T>(v: T | null): v is Exclude<T, null>;
/**
 * Type guard to filter out null-ish values
 *
 * @category Guards
 * @example array.filter(notUndefined)
 */
declare function notUndefined<T>(v: T): v is Exclude<T, undefined>;
/**
 * Type guard to filter out falsy values
 *
 * @category Guards
 * @example array.filter(isTruthy)
 */
declare function isTruthy<T>(v: T): v is NonNullable<T>;

declare const isDef: <T = any>(val?: T | undefined) => val is T;
declare const isBoolean: (val: any) => val is boolean;
declare const isFunction: <T extends Function>(val: any) => val is T;
declare const isNumber: (val: any) => val is number;
declare const isString: (val: unknown) => val is string;
declare const isObject: (val: any) => val is object;
declare const isWindow: (val: any) => boolean;
declare const isBrowser: boolean;

declare function clamp(n: number, min: number, max: number): number;
declare function sum(...args: number[] | number[][]): number;

/**
 * Replace backslash to slash
 *
 * @category String
 */
declare function slash(str: string): string;
/**
 * Ensure prefix of a string
 *
 * @category String
 */
declare function ensurePrefix(prefix: string, str: string): string;
/**
 * Dead simple template engine, just like Python's `.format()`
 *
 * @example
 * ```
 * const result = template(
 *   'Hello {0}! My name is {1}.',
 *   'Inès',
 *   'Anthony'
 * ) // Hello Inès! My name is Anthony.
 * ```
 */
declare function template(str: string, ...args: any[]): string;

declare const timestamp: () => number;

/**
 * Call every function in an array
 */
declare function batchInvoke(functions: Nullable<Fn>[]): void;
/**
 * Call the function
 */
declare function invoke(fn: Fn): void;
/**
 * Pass the value through the callback, and return the value
 *
 * @example
 * ```
 * function createUser(name: string): User {
 *   return tap(new User, user => {
 *     user.name = name
 *   })
 * }
 * ```
 */
declare function tap<T>(value: T, callback: (value: T) => void): T;

/**
 * Map key/value pairs for an object, and construct a new one
 *
 *
 * @category Object
 *
 * Transform:
 * @example
 * ```
 * objectMap({ a: 1, b: 2 }, (k, v) => [k.toString().toUpperCase(), v.toString()])
 * // { A: '1', B: '2' }
 * ```
 *
 * Swap key/value:
 * @example
 * ```
 * objectMap({ a: 1, b: 2 }, (k, v) => [v, k])
 * // { 1: 'a', 2: 'b' }
 * ```
 *
 * Filter keys:
 * @example
 * ```
 * objectMap({ a: 1, b: 2 }, (k, v) => k === 'a' ? undefined : [k, v])
 * // { b: 2 }
 * ```
 */
declare function objectMap<K extends string, V, NK = K, NV = V>(obj: Record<K, V>, fn: (key: K, value: V) => [NK, NV] | undefined): Record<K, V>;
/**
 * Type guard for any key, `k`.
 * Marks `k` as a key of `T` if `k` is in `obj`.
 *
 * @category Object
 * @param obj object to query for key `k`
 * @param k key to check existence in `obj`
 */
declare function isKeyOf<T extends object>(obj: T, k: keyof any): k is keyof T;
/**
 * Strict typed `Object.keys`
 *
 * @category Object
 */
declare function objectKeys<T extends object>(obj: T): (keyof T)[];
/**
 * Strict typed `Object.entries`
 *
 * @category Object
 */
declare function objectEntries<T extends object>(obj: T): [keyof T, T[keyof T]][];
/**
 * Deep merge :P
 *
 * @category Object
 */
declare function deepMerge<T extends object = object, S extends object = T>(target: T, ...sources: S[]): DeepMerge<T, S>;
/**
 * Create a new subset object by giving keys
 *
 * @category Object
 */
declare function objectPick<O, T extends keyof O>(obj: O, keys: T[], omitUndefined?: boolean): Pick<O, T>;
/**
 * Clear undefined fields from an object. It mutates the object
 *
 * @category Object
 */
declare function clearUndefined<T extends object>(obj: T): T;
/**
 * Determines whether an object has a property with the specified name
 *
 * @see https://eslint.org/docs/rules/no-prototype-builtins
 * @category Object
 */
declare function hasOwnProperty<T>(obj: T, v: PropertyKey): boolean;

interface SingletonPromiseReturn<T> {
    (): Promise<T>;
    /**
     * Reset current staled promise.
     * Await it to have proper shutdown.
     */
    reset: () => Promise<void>;
}
/**
 * Create singleton promise function
 *
 * @example
 * ```
 * const promise = createSingletonPromise(async () => { ... })
 *
 * await promise()
 * await promise() // all of them will be bind to a single promise instance
 * await promise() // and be resolved together
 * ```
 */
declare function createSingletonPromise<T>(fn: () => Promise<T>): SingletonPromiseReturn<T>;
/**
 * Promised `setTimeout`
 */
declare function sleep(ms: number, callback?: Fn<any>): Promise<void>;
/**
 * Create a promise lock
 *
 * @example
 * ```
 * const lock = createPromiseLock()
 *
 * lock.run(async () => {
 *   await doSomething()
 * })
 *
 * // in anther context:
 * await lock.wait() // it will wait all tasking finished
 * ```
 */
declare function createPromiseLock(): {
    run<T = void>(fn: () => Promise<T>): Promise<T>;
    wait(): Promise<void>;
    isWaiting(): boolean;
    clear(): void;
};

export { ArgumentsType, Arrayable, Awaitable, Constructor, DeepMerge, ElementOf, Fn, MergeInsertions, Nullable, PartitionFilter, SingletonPromiseReturn, UnionToIntersection, assert, at, batchInvoke, clamp, clampArrayRange, clearUndefined, createPromiseLock, createSingletonPromise, deepMerge, ensurePrefix, flattenArrayable, hasOwnProperty, invoke, isBoolean, isBrowser, isDef, isFunction, isKeyOf, isNumber, isObject, isString, isTruthy, isWindow, last, mergeArrayable, move, noNull, noop, notNullish, notUndefined, objectEntries, objectKeys, objectMap, objectPick, partition, range, remove, slash, sleep, sum, tap, template, timestamp, toArray, toString, uniq };
