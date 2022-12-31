declare let spies: Set<SpyImpl<any[], any>>;
declare type ReturnError = ['error', any];
declare type ReturnOk<R> = ['ok', R];
declare type ResultFn<R> = ReturnError | ReturnOk<R>;
interface Spy<A extends any[] = any[], R = any> {
    called: boolean;
    callCount: number;
    calls: A[];
    length: number;
    results: ResultFn<R>[];
    returns: R[];
    nextError(error: any): this;
    nextResult(result: R): this;
    reset(): void;
    impl: ((...args: A) => R) | undefined;
    next: ResultFn<R> | null;
}
interface SpyImpl<A extends any[] = any[], R = any> extends Spy<A, R> {
    getOriginal(): (...args: A) => R;
    willCall(cb: (...args: A) => R): this;
    restore(): void;
}
interface SpyFn<A extends any[] = any[], R = any> extends Spy<A, R> {
    (...args: A): R;
}
declare function spy<A extends any[], R>(cb?: (...args: A) => R): SpyFn<A, R>;

declare type Procedure = (...args: any[]) => any;
declare type Methods<T> = {
    [K in keyof T]: T[K] extends Procedure ? K : never;
}[keyof T];
declare type Getters<T> = {
    [K in keyof T]: T[K] extends Procedure ? never : K;
}[keyof T];
declare type Classes<T> = {
    [K in keyof T]: T[K] extends new (...args: any[]) => any ? K : never;
}[keyof T];
declare function spyOn<T, S extends Getters<Required<T>>>(obj: T, methodName: {
    setter: S;
}, mock?: (arg: T[S]) => void): SpyImpl<[T[S]], void>;
declare function spyOn<T, G extends Getters<Required<T>>>(obj: T, methodName: {
    getter: G;
}, mock?: () => T[G]): SpyImpl<[], T[G]>;
declare function spyOn<T, M extends Classes<Required<T>>>(object: T, method: M): Required<T>[M] extends new (...args: infer A) => infer R ? SpyImpl<A, R> : never;
declare function spyOn<T, M extends Methods<Required<T>>>(obj: T, methodName: M, mock?: T[M]): Required<T>[M] extends (...args: infer A) => infer R ? SpyImpl<A, R> : never;

declare function restoreAll(): void;

export { Spy, SpyFn, SpyImpl, restoreAll, spies, spy, spyOn };
