import type { MergeDeep } from './MergeDeep.js';
import type { Iteration, IterationOf, Pos, Next } from './Iteration.js';
import type { Length, List } from './List.js';
/**
 * Ask TS to re-check that `A1` extends `A2`.
 * And if it fails, `A2` will be enforced anyway.
 * Can also be used to add constraints on parameters.
 * @param A1 to check against
 * @param A2 to cast to
 * @returns `A1 | A2`
 * @example
 * ```ts
 * type test0 = Cast<'42', string> // '42'
 * type test1 = Cast<'42', number> // number
 * ```
 */
type Cast<A1, A2> = A1 extends A2 ? A1 : A2;
/**
 * Check whether `A1` is part of `A2` or not. The difference with
 * `extends` is that it forces a [[Boolean]] return.
 * @param A1
 * @param A2
 * @returns [[Boolean]]
 * @example
 * ```ts
 * type test0 = Extends<'a' | 'b', 'b'> // Boolean
 * type test1 = Extends<'a', 'a' | 'b'> // True
 *
 * type test2 = Extends<{a: string}, {a: any}>      // True
 * type test3 = Extends<{a: any}, {a: any, b: any}> // False
 *
 * type test4 = Extends<never, never> // False
 * /// Nothing cannot extend nothing, use `Equals`
 * ```
 */
type Extends<A1, A2> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
type __Assign<O extends Record<string | number | symbol, unknown>, Os extends List<Record<string | number | symbol, unknown>>, I extends Iteration = IterationOf<0>> = Extends<Pos<I>, Length<Os>> extends 1 ? O : __Assign<MergeDeep<O, Os[Pos<I>]>, Os, Next<I>>;
type _Assign<O extends Record<string | number | symbol, unknown>, Os extends List<Record<string | number | symbol, unknown>>> = __Assign<O, Os> extends infer X ? Cast<X, Record<string | number | symbol, unknown>> : never;
/**
 * Assign a list of [[Object]] into `O` with [[MergeDeep]]. Merges from right to
 * left, first items get overridden by the next ones (last-in overrides).
 * @param O to assign to
 * @param Os to assign
 * @returns [[Object]]
 * @example
 * ```ts
 * ```
 */
export type Assign<O extends Record<string | number | symbol, unknown>, Os extends List<Record<string | number | symbol, unknown>>> = O extends unknown ? (Os extends unknown ? _Assign<O, Os> : never) : never;
export {};
