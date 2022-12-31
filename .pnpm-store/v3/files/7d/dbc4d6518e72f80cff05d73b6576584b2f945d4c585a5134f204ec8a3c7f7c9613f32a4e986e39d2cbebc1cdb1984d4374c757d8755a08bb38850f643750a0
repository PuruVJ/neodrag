export declare const equalFn: <T>(a: T, b: T) => boolean;
export declare const $PROXY: unique symbol;
export declare const $TRACK: unique symbol;
export declare const $DEVCOMP: unique symbol;
export declare const DEV: {};
export declare type Accessor<T> = () => T;
export declare type Setter<T> = undefined extends T ? <U extends T>(value?: (U extends Function ? never : U) | ((prev?: T) => U)) => U : <U extends T>(value: (U extends Function ? never : U) | ((prev: T) => U)) => U;
export declare type Signal<T> = [get: Accessor<T>, set: Setter<T>];
export declare const BRANCH: unique symbol;
export declare function castError(err: any): string | Error;
export declare let Owner: Owner | null;
interface Owner {
    owner: Owner | null;
    context: any | null;
}
export declare function createRoot<T>(fn: (dispose: () => void) => T, detachedOwner?: Owner): T;
export declare function createSignal<T>(value: T, options?: {
    equals?: false | ((prev: T, next: T) => boolean);
    name?: string;
}): [get: () => T, set: (v: (T extends Function ? never : T) | ((prev: T) => T)) => T];
export declare function createComputed<T>(fn: (v?: T) => T, value?: T): void;
export declare const createRenderEffect: typeof createComputed;
export declare function createEffect<T>(fn: (v?: T) => T, value?: T): void;
export declare function createReaction(fn: () => void): (fn: () => void) => void;
export declare function createMemo<T>(fn: (v?: T) => T, value?: T): () => T;
export declare function createDeferred<T>(source: () => T): () => T;
export declare function createSelector<T>(source: () => T, fn?: (k: T, value: T) => boolean): (k: T) => boolean;
export declare function batch<T>(fn: () => T): T;
export declare const untrack: typeof batch;
export declare function on<T, U>(deps: Array<() => T> | (() => T), fn: (value: Array<T> | T, prev?: Array<T> | T, prevResults?: U) => U, options?: {
    defer?: boolean;
}): (prev?: U) => U | undefined;
export declare function onMount(fn: () => void): void;
export declare function onCleanup(fn: () => void): () => void;
export declare function cleanNode(node: {
    cleanups?: Function[] | null;
}): void;
export declare function onError(fn: (err: any) => void): void;
export declare function getListener(): null;
export interface Context<T> {
    id: symbol;
    Provider: (props: {
        value: T;
        children: any;
    }) => any;
    defaultValue?: T;
}
export declare function createContext<T>(defaultValue?: T): Context<T>;
export declare function useContext<T>(context: Context<T>): T;
export declare function getOwner(): Owner | null;
declare type ChildrenReturn = Accessor<any> & {
    toArray: () => any[];
};
export declare function children(fn: () => any): ChildrenReturn;
export declare function runWithOwner<T>(o: Owner, fn: () => T): T | undefined;
export declare function lookup(owner: Owner | null, key: symbol | string): any;
export interface Task {
    id: number;
    fn: ((didTimeout: boolean) => void) | null;
    startTime: number;
    expirationTime: number;
}
export declare function requestCallback(fn: () => void, options?: {
    timeout: number;
}): Task;
export declare function cancelCallback(task: Task): void;
export declare function mapArray<T, U>(list: () => T[], mapFn: (v: T, i: () => number) => U, options?: {
    fallback?: () => any;
}): () => U[];
export declare type ObservableObserver<T> = ((v: T) => void) | {
    next: (v: T) => void;
    error?: (v: any) => void;
    complete?: (v: boolean) => void;
};
export declare function observable<T>(input: Accessor<T>): {
    subscribe(observer: ObservableObserver<T>): {
        unsubscribe(): void;
    };
    [Symbol.observable](): any;
};
export declare function from<T>(producer: ((setter: Setter<T>) => () => void) | {
    subscribe: (fn: (v: T) => void) => (() => void) | {
        unsubscribe: () => void;
    };
}): Accessor<T>;
export declare function enableExternalSource(factory: any): void;
export {};
