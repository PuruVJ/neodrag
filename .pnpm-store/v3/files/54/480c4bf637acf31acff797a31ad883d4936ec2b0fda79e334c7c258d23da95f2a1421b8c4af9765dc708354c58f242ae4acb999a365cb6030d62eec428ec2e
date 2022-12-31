import { SpyImpl } from 'tinyspy';
import { w as SuiteAPI, v as TestAPI, aw as BenchmarkAPI, y as SuiteHooks, H as HookListener, L as TestContext, p as Suite, x as HookCleanupCallback, O as OnTestFailedHandler, q as Test } from './types-2a26f28c.js';

declare type Not<T extends boolean> = T extends true ? false : true;
declare type And<Types extends boolean[]> = Types[number] extends true ? true : false;
declare type Eq<Left extends boolean, Right extends boolean> = Left extends true ? Right : Not<Right>;
declare const secret: unique symbol;
declare type Secret = typeof secret;
declare type IsNever<T> = [T] extends [never] ? true : false;
declare type IsAny<T> = [T] extends [Secret] ? Not<IsNever<T>> : false;
declare type IsUnknown<T> = [unknown] extends [T] ? Not<IsAny<T>> : false;
/**
 * Recursively walk a type and replace it with a branded type related to the original. This is useful for
 * equality-checking stricter than `A extends B ? B extends A ? true : false : false`, because it detects
 * the difference between a few edge-case types that vanilla typescript doesn't by default:
 * - `any` vs `unknown`
 * - `{ readonly a: string }` vs `{ a: string }`
 * - `{ a?: string }` vs `{ a: string | undefined }`
 */
declare type DeepBrand<T> = IsNever<T> extends true ? {
    type: 'never';
} : IsAny<T> extends true ? {
    type: 'any';
} : IsUnknown<T> extends true ? {
    type: 'unknown';
} : T extends string | number | boolean | symbol | bigint | null | undefined | void ? {
    type: 'primitive';
    value: T;
} : T extends new (...args: any[]) => any ? {
    type: 'constructor';
    params: ConstructorParams<T>;
    instance: DeepBrand<InstanceType<Extract<T, new (...args: any) => any>>>;
} : T extends (...args: infer P) => infer R ? {
    type: 'function';
    params: DeepBrand<P>;
    return: DeepBrand<R>;
} : T extends any[] ? {
    type: 'array';
    items: {
        [K in keyof T]: T[K];
    };
} : {
    type: 'object';
    properties: {
        [K in keyof T]: DeepBrand<T[K]>;
    };
    readonly: ReadonlyKeys<T>;
    required: RequiredKeys<T>;
    optional: OptionalKeys<T>;
    constructorParams: DeepBrand<ConstructorParams<T>>;
};
declare type RequiredKeys<T> = Extract<{
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T], keyof T>;
declare type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
declare type ReadonlyKeys<T> = Extract<{
    [K in keyof T]-?: ReadonlyEquivalent<{
        [_K in K]: T[K];
    }, {
        -readonly [_K in K]: T[K];
    }> extends true ? never : K;
}[keyof T], keyof T>;
declare type ReadonlyEquivalent<X, Y> = Extends<(<T>() => T extends X ? true : false), (<T>() => T extends Y ? true : false)>;
declare type Extends<L, R> = IsNever<L> extends true ? IsNever<R> : [L] extends [R] ? true : false;
declare type StrictExtends<L, R> = Extends<DeepBrand<L>, DeepBrand<R>>;
declare type Equal<Left, Right> = And<[StrictExtends<Left, Right>, StrictExtends<Right, Left>]>;
declare type Params<Actual> = Actual extends (...args: infer P) => any ? P : never;
declare type ConstructorParams<Actual> = Actual extends new (...args: infer P) => any ? Actual extends new () => any ? P | [] : P : never;
declare type MismatchArgs<B extends boolean, C extends boolean> = Eq<B, C> extends true ? [] : [never];
interface ExpectTypeOf<Actual, B extends boolean> {
    toBeAny: (...MISMATCH: MismatchArgs<IsAny<Actual>, B>) => true;
    toBeUnknown: (...MISMATCH: MismatchArgs<IsUnknown<Actual>, B>) => true;
    toBeNever: (...MISMATCH: MismatchArgs<IsNever<Actual>, B>) => true;
    toBeFunction: (...MISMATCH: MismatchArgs<Extends<Actual, (...args: any[]) => any>, B>) => true;
    toBeObject: (...MISMATCH: MismatchArgs<Extends<Actual, object>, B>) => true;
    toBeArray: (...MISMATCH: MismatchArgs<Extends<Actual, any[]>, B>) => true;
    toBeNumber: (...MISMATCH: MismatchArgs<Extends<Actual, number>, B>) => true;
    toBeString: (...MISMATCH: MismatchArgs<Extends<Actual, string>, B>) => true;
    toBeBoolean: (...MISMATCH: MismatchArgs<Extends<Actual, boolean>, B>) => true;
    toBeVoid: (...MISMATCH: MismatchArgs<Extends<Actual, void>, B>) => true;
    toBeSymbol: (...MISMATCH: MismatchArgs<Extends<Actual, symbol>, B>) => true;
    toBeNull: (...MISMATCH: MismatchArgs<Extends<Actual, null>, B>) => true;
    toBeUndefined: (...MISMATCH: MismatchArgs<Extends<Actual, undefined>, B>) => true;
    toBeNullable: (...MISMATCH: MismatchArgs<Not<Equal<Actual, NonNullable<Actual>>>, B>) => true;
    toMatchTypeOf: {
        <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, B>): true;
        <Expected>(expected: Expected, ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, B>): true;
    };
    toEqualTypeOf: {
        <Expected>(...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>): true;
        <Expected>(expected: Expected, ...MISMATCH: MismatchArgs<Equal<Actual, Expected>, B>): true;
    };
    toBeCallableWith: B extends true ? (...args: Params<Actual>) => true : never;
    toBeConstructibleWith: B extends true ? (...args: ConstructorParams<Actual>) => true : never;
    toHaveProperty: <K extends string>(key: K, ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, B>) => K extends keyof Actual ? ExpectTypeOf<Actual[K], B> : true;
    extract: <V>(v?: V) => ExpectTypeOf<Extract<Actual, V>, B>;
    exclude: <V>(v?: V) => ExpectTypeOf<Exclude<Actual, V>, B>;
    parameter: <K extends keyof Params<Actual>>(number: K) => ExpectTypeOf<Params<Actual>[K], B>;
    parameters: ExpectTypeOf<Params<Actual>, B>;
    constructorParameters: ExpectTypeOf<ConstructorParams<Actual>, B>;
    instance: Actual extends new (...args: any[]) => infer I ? ExpectTypeOf<I, B> : never;
    returns: Actual extends (...args: any[]) => infer R ? ExpectTypeOf<R, B> : never;
    resolves: Actual extends PromiseLike<infer R> ? ExpectTypeOf<R, B> : never;
    items: Actual extends ArrayLike<infer R> ? ExpectTypeOf<R, B> : never;
    guards: Actual extends (v: any, ...args: any[]) => v is infer T ? ExpectTypeOf<T, B> : never;
    asserts: Actual extends (v: any, ...args: any[]) => asserts v is infer T ? unknown extends T ? never : ExpectTypeOf<T, B> : never;
    not: ExpectTypeOf<Actual, Not<B>>;
}
declare type _ExpectTypeOf = {
    <Actual>(actual: Actual): ExpectTypeOf<Actual, true>;
    <Actual>(): ExpectTypeOf<Actual, true>;
};
/**
 * Similar to Jest's `expect`, but with type-awareness.
 * Gives you access to a number of type-matchers that let you make assertions about the
 * form of a reference or generic type parameter.
 *
 * @example
 * import {foo, bar} from '../foo'
 * import {expectTypeOf} from 'expect-type'
 *
 * test('foo types', () => {
 *   // make sure `foo` has type {a: number}
 *   expectTypeOf(foo).toMatchTypeOf({a: 1})
 *   expectTypeOf(foo).toHaveProperty('a').toBeNumber()
 *
 *   // make sure `bar` is a function taking a string:
 *   expectTypeOf(bar).parameter(0).toBeString()
 *   expectTypeOf(bar).returns.not.toBeAny()
 * })
 *
 * @description
 * See the [full docs](https://npmjs.com/package/expect-type#documentation) for lots more examples.
 */
declare const expectTypeOf: _ExpectTypeOf;

interface AssertType {
    <T>(value: T): void;
}
declare const assertType: AssertType;

interface MockResultReturn<T> {
    type: 'return';
    value: T;
}
interface MockResultIncomplete {
    type: 'incomplete';
    value: undefined;
}
interface MockResultThrow {
    type: 'throw';
    value: any;
}
type MockResult<T> = MockResultReturn<T> | MockResultThrow | MockResultIncomplete;
interface MockContext<TArgs, TReturns> {
    calls: TArgs[];
    instances: TReturns[];
    invocationCallOrder: number[];
    results: MockResult<TReturns>[];
    lastCall: TArgs | undefined;
}
type Procedure = (...args: any[]) => any;
type Methods<T> = {
    [K in keyof T]: T[K] extends Procedure ? K : never;
}[keyof T] & (string | symbol);
type Properties<T> = {
    [K in keyof T]: T[K] extends Procedure ? never : K;
}[keyof T] & (string | symbol);
type Classes<T> = {
    [K in keyof T]: T[K] extends new (...args: any[]) => any ? K : never;
}[keyof T] & (string | symbol);
interface SpyInstance<TArgs extends any[] = any[], TReturns = any> {
    getMockName(): string;
    mockName(n: string): this;
    mock: MockContext<TArgs, TReturns>;
    mockClear(): this;
    mockReset(): this;
    mockRestore(): void;
    getMockImplementation(): ((...args: TArgs) => TReturns) | undefined;
    mockImplementation(fn: ((...args: TArgs) => TReturns) | (() => Promise<TReturns>)): this;
    mockImplementationOnce(fn: ((...args: TArgs) => TReturns) | (() => Promise<TReturns>)): this;
    mockReturnThis(): this;
    mockReturnValue(obj: TReturns): this;
    mockReturnValueOnce(obj: TReturns): this;
    mockResolvedValue(obj: Awaited<TReturns>): this;
    mockResolvedValueOnce(obj: Awaited<TReturns>): this;
    mockRejectedValue(obj: any): this;
    mockRejectedValueOnce(obj: any): this;
}
interface MockInstance<A extends any[] = any[], R = any> extends SpyInstance<A, R> {
}
interface Mock<TArgs extends any[] = any, TReturns = any> extends SpyInstance<TArgs, TReturns> {
    new (...args: TArgs): TReturns;
    (...args: TArgs): TReturns;
}
interface PartialMock<TArgs extends any[] = any, TReturns = any> extends SpyInstance<TArgs, Partial<TReturns>> {
    new (...args: TArgs): TReturns;
    (...args: TArgs): TReturns;
}
type MaybeMockedConstructor<T> = T extends new (...args: Array<any>) => infer R ? Mock<ConstructorParameters<T>, R> : T;
type MockedFunction<T extends Procedure> = Mock<Parameters<T>, ReturnType<T>> & {
    [K in keyof T]: T[K];
};
type PartiallyMockedFunction<T extends Procedure> = PartialMock<Parameters<T>, ReturnType<T>> & {
    [K in keyof T]: T[K];
};
type MockedFunctionDeep<T extends Procedure> = Mock<Parameters<T>, ReturnType<T>> & MockedObjectDeep<T>;
type PartiallyMockedFunctionDeep<T extends Procedure> = PartialMock<Parameters<T>, ReturnType<T>> & MockedObjectDeep<T>;
type MockedObject<T> = MaybeMockedConstructor<T> & {
    [K in Methods<T>]: T[K] extends Procedure ? MockedFunction<T[K]> : T[K];
} & {
    [K in Properties<T>]: T[K];
};
type MockedObjectDeep<T> = MaybeMockedConstructor<T> & {
    [K in Methods<T>]: T[K] extends Procedure ? MockedFunctionDeep<T[K]> : T[K];
} & {
    [K in Properties<T>]: MaybeMockedDeep<T[K]>;
};
type MaybeMockedDeep<T> = T extends Procedure ? MockedFunctionDeep<T> : T extends object ? MockedObjectDeep<T> : T;
type MaybePartiallyMockedDeep<T> = T extends Procedure ? PartiallyMockedFunctionDeep<T> : T extends object ? MockedObjectDeep<T> : T;
type MaybeMocked<T> = T extends Procedure ? MockedFunction<T> : T extends object ? MockedObject<T> : T;
type MaybePartiallyMocked<T> = T extends Procedure ? PartiallyMockedFunction<T> : T extends object ? MockedObject<T> : T;
interface Constructable {
    new (...args: any[]): any;
}
type MockedClass<T extends Constructable> = MockInstance<T extends new (...args: infer P) => any ? P : never, InstanceType<T>> & {
    prototype: T extends {
        prototype: any;
    } ? Mocked<T['prototype']> : never;
} & T;
type Mocked<T> = {
    [P in keyof T]: T[P] extends (...args: infer Args) => infer Returns ? MockInstance<Args, Returns> : T[P] extends Constructable ? MockedClass<T[P]> : T[P];
} & T;
type EnhancedSpy<TArgs extends any[] = any[], TReturns = any> = SpyInstance<TArgs, TReturns> & SpyImpl<TArgs, TReturns>;
declare function spyOn<T, S extends Properties<Required<T>>>(obj: T, methodName: S, accessType: 'get'): SpyInstance<[], T[S]>;
declare function spyOn<T, G extends Properties<Required<T>>>(obj: T, methodName: G, accessType: 'set'): SpyInstance<[T[G]], void>;
declare function spyOn<T, M extends (Methods<Required<T>> | Classes<Required<T>>)>(obj: T, methodName: M): Required<T>[M] extends (...args: infer A) => infer R | (new (...args: infer A) => infer R) ? SpyInstance<A, R> : never;
declare function fn<TArgs extends any[] = any[], R = any>(): Mock<TArgs, R>;
declare function fn<TArgs extends any[] = any[], R = any>(implementation: (...args: TArgs) => R): Mock<TArgs, R>;

declare const suite: SuiteAPI<{}>;
declare const test: TestAPI<{}>;
declare const bench: BenchmarkAPI;
declare const describe: SuiteAPI<{}>;
declare const it: TestAPI<{}>;

declare const beforeAll: (fn: SuiteHooks['beforeAll'][0], timeout?: number) => void;
declare const afterAll: (fn: SuiteHooks['afterAll'][0], timeout?: number) => void;
declare const beforeEach: <ExtraContext = {}>(fn: HookListener<[TestContext & ExtraContext, Suite], HookCleanupCallback>, timeout?: number) => void;
declare const afterEach: <ExtraContext = {}>(fn: HookListener<[TestContext & ExtraContext, Suite], void>, timeout?: number) => void;
declare const onTestFailed: (fn: OnTestFailedHandler) => void;

declare function createExpect(test?: Test): Vi.ExpectStatic;
declare const globalExpect: Vi.ExpectStatic;

export { AssertType as A, MockedClass as B, EnhancedSpy as E, MaybeMockedDeep as M, SpyInstance as S, MaybeMocked as a, MaybePartiallyMocked as b, MaybePartiallyMockedDeep as c, suite as d, describe as e, fn as f, bench as g, beforeAll as h, it as i, afterAll as j, beforeEach as k, afterEach as l, globalExpect as m, createExpect as n, onTestFailed as o, expectTypeOf as p, ExpectTypeOf as q, assertType as r, spyOn as s, test as t, MockedFunction as u, MockedObject as v, MockInstance as w, Mock as x, MockContext as y, Mocked as z };
