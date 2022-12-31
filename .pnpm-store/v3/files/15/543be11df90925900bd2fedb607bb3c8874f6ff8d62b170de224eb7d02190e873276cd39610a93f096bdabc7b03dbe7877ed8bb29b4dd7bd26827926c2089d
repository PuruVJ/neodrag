import { Accessor } from "../reactive/signal.js";
import type { JSX } from "../jsx.js";
/**
 * creates a list elements from a list
 *
 * it receives a map function as its child that receives a list element and an accessor with the index and returns a JSX-Element; if the list is empty, an optional fallback is returned:
 * ```typescript
 * <For each={items} fallback={<div>No items</div>}>
 *   {(item, index) => <div data-index={index()}>{item}</div>}
 * </For>
 * ```
 * If you have a list with fixed indices and changing values, consider using `<Index>` instead.
 *
 * @description https://www.solidjs.com/docs/latest/api#%3Cfor%3E
 */
export declare function For<T, U extends JSX.Element>(props: {
    each: readonly T[] | undefined | null | false;
    fallback?: JSX.Element;
    children: (item: T, index: Accessor<number>) => U;
}): Accessor<U[]>;
/**
 * Non-keyed iteration over a list creating elements from its items
 *
 * To be used if you have a list with fixed indices, but changing values.
 * ```typescript
 * <Index each={items} fallback={<div>No items</div>}>
 *   {(item, index) => <div data-index={index}>{item()}</div>}
 * </Index>
 * ```
 * If you have a list with changing indices, better use `<For>`.
 *
 * @description https://www.solidjs.com/docs/latest/api#%3Cindex%3E
 */
export declare function Index<T, U extends JSX.Element>(props: {
    each: readonly T[] | undefined | null | false;
    fallback?: JSX.Element;
    children: (item: Accessor<T>, index: number) => U;
}): Accessor<U[]>;
/**
 * Conditionally render its children or an optional fallback component
 * @description https://www.solidjs.com/docs/latest/api#%3Cshow%3E
 */
export declare function Show<T>(props: {
    when: T | undefined | null | false;
    keyed: true;
    fallback?: JSX.Element;
    children: JSX.Element | ((item: NonNullable<T>) => JSX.Element);
}): () => JSX.Element;
export declare function Show<T>(props: {
    when: T | undefined | null | false;
    keyed?: false;
    fallback?: JSX.Element;
    children: JSX.Element;
}): () => JSX.Element;
/**
 * switches between content based on mutually exclusive conditions
 * ```typescript
 * <Switch fallback={<FourOhFour />}>
 *   <Match when={state.route === 'home'}>
 *     <Home />
 *   </Match>
 *   <Match when={state.route === 'settings'}>
 *     <Settings />
 *   </Match>
 * </Switch>
 * ```
 * @description https://www.solidjs.com/docs/latest/api#%3Cswitch%3E%2F%3Cmatch%3E
 */
export declare function Switch(props: {
    fallback?: JSX.Element;
    children: JSX.Element;
}): Accessor<JSX.Element>;
export declare type MatchProps<T> = {
    when: T | undefined | null | false;
    keyed?: boolean;
    children: JSX.Element | ((item: NonNullable<T>) => JSX.Element);
};
/**
 * selects a content based on condition when inside a `<Switch>` control flow
 * ```typescript
 * <Match when={condition()}>
 *   <Content/>
 * </Match>
 * ```
 * @description https://www.solidjs.com/docs/latest/api#%3Cswitch%3E%2F%3Cmatch%3E
 */
export declare function Match<T>(props: {
    when: T | undefined | null | false;
    keyed: true;
    children: JSX.Element | ((item: NonNullable<T>) => JSX.Element);
}): JSX.Element;
export declare function Match<T>(props: {
    when: T | undefined | null | false;
    keyed?: false;
    children: JSX.Element;
}): JSX.Element;
export declare function resetErrorBoundaries(): void;
/**
 * catches uncaught errors inside components and renders a fallback content
 *
 * Also supports a callback form that passes the error and a reset function:
 * ```typescript
 * <ErrorBoundary fallback={
 *   (err, reset) => <div onClick={reset}>Error: {err.toString()}</div>
 * }>
 *   <MyComp />
 * </ErrorBoundary>
 * ```
 * Errors thrown from the fallback can be caught by a parent ErrorBoundary
 *
 * @description https://www.solidjs.com/docs/latest/api#%3Cerrorboundary%3E
 */
export declare function ErrorBoundary(props: {
    fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element);
    children: JSX.Element;
}): Accessor<JSX.Element>;
