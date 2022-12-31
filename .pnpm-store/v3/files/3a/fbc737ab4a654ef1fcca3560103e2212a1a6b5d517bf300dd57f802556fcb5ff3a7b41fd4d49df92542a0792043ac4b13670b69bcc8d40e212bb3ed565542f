import { Accessor } from "./signal.js";
/**
 * reactively transforms an array with a callback function - underlying helper for the `<For>` control flow
 *
 * similar to `Array.prototype.map`, but gets the index as accessor, transforms only values that changed and returns an accessor and reactively tracks changes to the list.
 *
 * @description https://www.solidjs.com/docs/latest/api#maparray
 */
export declare function mapArray<T, U>(list: Accessor<readonly T[] | undefined | null | false>, mapFn: (v: T, i: Accessor<number>) => U, options?: {
    fallback?: Accessor<any>;
}): () => U[];
/**
 * reactively maps arrays by index instead of value - underlying helper for the `<Index>` control flow
 *
 * similar to `Array.prototype.map`, but gets the value as an accessor, transforms only changed items of the original arrays anew and returns an accessor.
 *
 * @description https://www.solidjs.com/docs/latest/api#indexarray
 */
export declare function indexArray<T, U>(list: Accessor<readonly T[] | undefined | null | false>, mapFn: (v: Accessor<T>, i: number) => U, options?: {
    fallback?: Accessor<any>;
}): () => U[];
