/**
 * Get the keys of `O` that are optional
 * @param O
 * @returns [[Key]]
 * @example
 * ```ts
 * ```
 */
type OptionalKeys<O extends object> = O extends unknown ? {
    [K in keyof O]-?: {} extends Pick<O, K> ? K : never;
}[keyof O] : never;
/**
 * Get the keys of `O` that are required
 * @param O
 * @returns [[Key]]
 * @example
 * ```ts
 * ```
 */
type RequiredKeys<O extends object> = O extends unknown ? {
    [K in keyof O]-?: {} extends Pick<O, K> ? never : K;
}[keyof O] : never;
type MergeObjectDeeply<O extends Record<string | number | symbol, unknown>, O1 extends Record<string | number | symbol, unknown>> = {
    [K in keyof (O & O1)]: K extends RequiredKeys<O1> ? MergeObjectsOrReturnFallback<O[K], O1[K], O1[K]> : K extends OptionalKeys<O1> ? K extends OptionalKeys<O> ? MergeObjectsOrReturnFallback<Exclude<O[K], undefined>, Exclude<O1[K], undefined>, Exclude<O[K], undefined> | Exclude<O1[K], undefined>> : K extends RequiredKeys<O> ? Exclude<O1[K], undefined> extends O[K] ? O[K] : MergeObjectsOrReturnFallback<O[K], Exclude<O1[K], undefined>, O[K] | Exclude<O1[K], undefined>> : O1[K] : O[K];
};
type MergeObjectsOrReturnFallback<O, O1, Fallback> = O extends Record<string | number | symbol, unknown> ? O1 extends Record<string | number | symbol, unknown> ? MergeObjectDeeply<O, O1> : Fallback : Fallback;
/**
 * Accurately merge the fields of `O` with the ones of `O1`. It is
 * equivalent to the spread operator in JavaScript. [[Union]]s and [[Optional]]
 * fields will be handled gracefully.
 *
 * (⚠️ needs `--strictNullChecks` enabled)
 * @param O to complete
 * @param O1 to copy from
 * @returns [[Object]]
 * @example
 * ```ts
 * import { PrettyPrint } from './PrettyPrint'
 *
 * type A1 = { a: number; b?: number;            d?: number; e?: number; x: string;             y?: number; z: string;  } // prettier-ignore
 * type A2 = { a?: number;           c?: number; d?: number; e: number;  x: number | undefined; y?: string; z?: number; } // prettier-ignore
 *
 * type Result = PrettyPrint<MergeDeep<A1, A2>>
 * {
 *    a: number;
 *    b?: number | undefined;
 *    c?: number | undefined;
 *    d?: number | undefined;
 *    e: number;
 *    x: number | undefined;
 *    y?: string | number | undefined;
 *    z: string | number;
 * }
 * ```
 */
export type MergeDeep<O extends Record<string | number | symbol, unknown>, O1 extends Record<string | number | symbol, unknown>> = O extends unknown ? (O1 extends unknown ? MergeObjectDeeply<O, O1> : never) : never;
export {};
