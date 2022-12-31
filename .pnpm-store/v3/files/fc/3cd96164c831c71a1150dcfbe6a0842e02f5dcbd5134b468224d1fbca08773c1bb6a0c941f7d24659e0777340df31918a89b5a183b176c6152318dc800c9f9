/**
 * A [[List]]
 * @param T its type
 * @returns [[List]]
 * @example
 * ```ts
 * type list0 = [1, 2, 3]
 * type list1 = number[]
 * ```
 */
export type List<T = any> = readonly T[];
/**
 * Get the length of `L`
 * @param L to get length
 * @returns [[String]] or `number`
 * @example
 * ```ts
 * ```
 */
export type Length<L extends List> = L['length'];
/**
 * Return the last item out of a [[List]]
 * @param L
 * @returns [[List]]
 * @example
 * ```ts
 * ```
 */
export type Pop<L extends List> = L extends readonly [] ? never : L extends [...unknown[], infer Last] ? Last : L extends (infer T)[] ? T : never;
