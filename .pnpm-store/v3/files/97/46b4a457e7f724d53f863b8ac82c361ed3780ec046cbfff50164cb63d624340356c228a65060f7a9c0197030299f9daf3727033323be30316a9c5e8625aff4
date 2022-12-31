export declare const $RAW: unique symbol, $NODE: unique symbol, $NAME: unique symbol;
declare global {
    var _$onStoreNodeUpdate: OnStoreNodeUpdate | undefined;
}
declare type DataNode = {
    (): any;
    $(value?: any): void;
};
declare type DataNodes = Record<PropertyKey, DataNode>;
export declare type OnStoreNodeUpdate = (state: StoreNode, property: PropertyKey, value: StoreNode | NotWrappable, prev: StoreNode | NotWrappable) => void;
export interface StoreNode {
    [$NAME]?: string;
    [$NODE]?: DataNodes;
    [key: PropertyKey]: any;
}
export declare namespace SolidStore {
    interface Unwrappable {
    }
}
export declare type NotWrappable = string | number | bigint | symbol | boolean | Function | null | undefined | SolidStore.Unwrappable[keyof SolidStore.Unwrappable];
export declare type Store<T> = T;
export declare function isWrappable<T>(obj: T | NotWrappable): obj is T;
/**
 * Returns the underlying data in the store without a proxy.
 * @param item store proxy object
 * @example
 * ```js
 * const initial = {z...};
 * const [state, setState] = createStore(initial);
 * initial === state; // => false
 * initial === unwrap(state); // => true
 * ```
 */
export declare function unwrap<T>(item: T, set?: Set<unknown>): T;
export declare function getDataNodes(target: StoreNode): DataNodes;
export declare function getDataNode(nodes: DataNodes, property: PropertyKey, value: any): DataNode;
export declare function proxyDescriptor(target: StoreNode, property: PropertyKey): PropertyDescriptor | undefined;
export declare function trackSelf(target: StoreNode): void;
export declare function ownKeys(target: StoreNode): (string | symbol)[];
export declare function setProperty(state: StoreNode, property: PropertyKey, value: any, deleting?: boolean): void;
export declare function updatePath(current: StoreNode, path: any[], traversed?: PropertyKey[]): void;
/** @deprecated */
export declare type DeepReadonly<T> = 0 extends 1 & T ? T : T extends NotWrappable ? T : {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
};
/** @deprecated */
export declare type DeepMutable<T> = 0 extends 1 & T ? T : T extends NotWrappable ? T : {
    -readonly [K in keyof T]: DeepMutable<T[K]>;
};
export declare type CustomPartial<T> = T extends readonly unknown[] ? "0" extends keyof T ? {
    [K in Extract<keyof T, `${number}`>]?: T[K];
} : {
    [x: number]: T[number];
} : Partial<T>;
export declare type StorePathRange = {
    from?: number;
    to?: number;
    by?: number;
};
export declare type ArrayFilterFn<T> = (item: T, index: number) => boolean;
export declare type StoreSetter<T, U extends PropertyKey[] = []> = ((prevState: T, traversed: U) => T | CustomPartial<T>) | T | CustomPartial<T>;
export declare type Part<T, K extends KeyOf<T> = KeyOf<T>> = K | ([K] extends [never] ? never : readonly K[]) | ([T] extends [readonly unknown[]] ? ArrayFilterFn<T[number]> | StorePathRange : never);
declare type W<T> = Exclude<T, NotWrappable>;
declare type KeyOf<T> = number extends keyof T ? 0 extends 1 & T ? keyof T : [T] extends [readonly unknown[]] ? number : [T] extends [never] ? never : keyof T : keyof T;
declare type Rest<T, U extends PropertyKey[]> = [StoreSetter<T, U>] | (0 extends 1 & T ? [...Part<any>[], StoreSetter<any, PropertyKey[]>] : DistributeRest<W<T>, KeyOf<W<T>>, U>);
declare type DistributeRest<T, K, U extends PropertyKey[]> = [T] extends [never] ? never : K extends KeyOf<T> ? [Part<T, K>, ...Rest<T[K], [K, ...U]>] : never;
export interface SetStoreFunction<T> {
    <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>, K4 extends KeyOf<W<W<W<W<T>[K1]>[K2]>[K3]>>, K5 extends KeyOf<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>>, K6 extends KeyOf<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>>, K7 extends KeyOf<W<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, k4: Part<W<W<W<W<T>[K1]>[K2]>[K3]>, K4>, k5: Part<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>, K5>, k6: Part<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>, k7: Part<W<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>, K7>, ...rest: Rest<W<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7], [K7, K6, K5, K4, K3, K2, K1]>): void;
    <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>, K4 extends KeyOf<W<W<W<W<T>[K1]>[K2]>[K3]>>, K5 extends KeyOf<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>>, K6 extends KeyOf<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, k4: Part<W<W<W<W<T>[K1]>[K2]>[K3]>, K4>, k5: Part<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>, K5>, k6: Part<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>, setter: StoreSetter<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6], [K6, K5, K4, K3, K2, K1]>): void;
    <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>, K4 extends KeyOf<W<W<W<W<T>[K1]>[K2]>[K3]>>, K5 extends KeyOf<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, k4: Part<W<W<W<W<T>[K1]>[K2]>[K3]>, K4>, k5: Part<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>, K5>, setter: StoreSetter<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5], [K5, K4, K3, K2, K1]>): void;
    <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>, K4 extends KeyOf<W<W<W<W<T>[K1]>[K2]>[K3]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, k4: Part<W<W<W<W<T>[K1]>[K2]>[K3]>, K4>, setter: StoreSetter<W<W<W<W<T>[K1]>[K2]>[K3]>[K4], [K4, K3, K2, K1]>): void;
    <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, setter: StoreSetter<W<W<W<T>[K1]>[K2]>[K3], [K3, K2, K1]>): void;
    <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, setter: StoreSetter<W<W<T>[K1]>[K2], [K2, K1]>): void;
    <K1 extends KeyOf<W<T>>>(k1: Part<W<T>, K1>, setter: StoreSetter<W<T>[K1], [K1]>): void;
    (setter: StoreSetter<T, []>): void;
}
/**
 * creates a reactive store that can be read through a proxy object and written with a setter function
 *
 * @description https://www.solidjs.com/docs/latest/api#createstore
 */
export declare function createStore<T extends object = {}>(...[store, options]: {} extends T ? [store?: T | Store<T>, options?: {
    name?: string;
}] : [store: T | Store<T>, options?: {
    name?: string;
}]): [get: Store<T>, set: SetStoreFunction<T>];
export {};
