import type { JSX } from "../jsx.js";
export declare function enableHydration(): void;
/**
 * A general `Component` has no implicit `children` prop.  If desired, you can
 * specify one as in `Component<{name: String, children: JSX.Element}>`.
 */
export declare type Component<P = {}> = (props: P) => JSX.Element;
/**
 * Extend props to forbid the `children` prop.
 * Use this to prevent accidentally passing `children` to components that
 * would silently throw them away.
 */
export declare type VoidProps<P = {}> = P & {
    children?: never;
};
/**
 * `VoidComponent` forbids the `children` prop.
 * Use this to prevent accidentally passing `children` to components that
 * would silently throw them away.
 */
export declare type VoidComponent<P = {}> = Component<VoidProps<P>>;
/**
 * Extend props to allow an optional `children` prop with the usual
 * type in JSX, `JSX.Element` (which allows elements, arrays, functions, etc.).
 * Use this for components that you want to accept children.
 */
export declare type ParentProps<P = {}> = P & {
    children?: JSX.Element;
};
/**
 * `ParentComponent` allows an optional `children` prop with the usual
 * type in JSX, `JSX.Element` (which allows elements, arrays, functions, etc.).
 * Use this for components that you want to accept children.
 */
export declare type ParentComponent<P = {}> = Component<ParentProps<P>>;
/**
 * Extend props to require a `children` prop with the specified type.
 * Use this for components where you need a specific child type,
 * typically a function that receives specific argument types.
 * Note that all JSX <Elements> are of the type `JSX.Element`.
 */
export declare type FlowProps<P = {}, C = JSX.Element> = P & {
    children: C;
};
/**
 * `FlowComponent` requires a `children` prop with the specified type.
 * Use this for components where you need a specific child type,
 * typically a function that receives specific argument types.
 * Note that all JSX <Elements> are of the type `JSX.Element`.
 */
export declare type FlowComponent<P = {}, C = JSX.Element> = Component<FlowProps<P, C>>;
/** @deprecated: use `ParentProps` instead */
export declare type PropsWithChildren<P = {}> = ParentProps<P>;
export declare type ValidComponent = keyof JSX.IntrinsicElements | Component<any> | (string & {});
/**
 * Takes the props of the passed component and returns its type
 *
 * @example
 * ComponentProps<typeof Portal> // { mount?: Node; useShadow?: boolean; children: JSX.Element }
 * ComponentProps<'div'> // JSX.HTMLAttributes<HTMLDivElement>
 */
export declare type ComponentProps<T extends ValidComponent> = T extends Component<infer P> ? P : T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] : Record<string, unknown>;
/**
 * Type of `props.ref`, for use in `Component` or `props` typing.
 *
 * @example Component<{ref: Ref<Element>}>
 */
export declare type Ref<T> = T | ((val: T) => void);
export declare function createComponent<T>(Comp: Component<T>, props: T): JSX.Element;
declare type DistributeOverride<T, F> = T extends undefined ? F : T;
declare type Override<T, U> = T extends any ? U extends any ? {
    [K in keyof T]: K extends keyof U ? DistributeOverride<U[K], T[K]> : T[K];
} & {
    [K in keyof U]: K extends keyof T ? DistributeOverride<U[K], T[K]> : U[K];
} : T & U : T & U;
declare type OverrideSpread<T, U> = T extends any ? {
    [K in keyof ({
        [K in keyof T]: any;
    } & {
        [K in keyof U]?: any;
    } & {
        [K in U extends any ? keyof U : keyof U]?: any;
    })]: K extends keyof T ? Exclude<U extends any ? U[K & keyof U] : never, undefined> | T[K] : U extends any ? U[K & keyof U] : never;
} : T & U;
declare type Simplify<T> = T extends any ? {
    [K in keyof T]: T[K];
} : T;
declare type _MergeProps<T extends unknown[], Curr = {}> = T extends [
    infer Next | (() => infer Next),
    ...infer Rest
] ? _MergeProps<Rest, Override<Curr, Next>> : T extends [...infer Rest, infer Next | (() => infer Next)] ? Override<_MergeProps<Rest, Curr>, Next> : T extends [] ? Curr : T extends (infer I | (() => infer I))[] ? OverrideSpread<Curr, I> : Curr;
export declare type MergeProps<T extends unknown[]> = Simplify<_MergeProps<T>>;
export declare function mergeProps<T extends unknown[]>(...sources: T): MergeProps<T>;
export declare type SplitProps<T, K extends (readonly (keyof T)[])[]> = [
    ...{
        [P in keyof K]: P extends `${number}` ? Pick<T, Extract<K[P], readonly (keyof T)[]>[number]> : never;
    },
    Omit<T, K[number][number]>
];
export declare function splitProps<T, K extends [readonly (keyof T)[], ...(readonly (keyof T)[])[]]>(props: T, ...keys: K): SplitProps<T, K>;
export declare function lazy<T extends Component<any>>(fn: () => Promise<{
    default: T;
}>): T & {
    preload: () => Promise<{
        default: T;
    }>;
};
export declare function createUniqueId(): string;
export {};
