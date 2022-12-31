import { hydrate as hydrateCore } from "./client.js";
import { JSX, Accessor, ComponentProps, ValidComponent } from "solid-js";
export * from "./client.js";
export { For, Show, Suspense, SuspenseList, Switch, Match, Index, ErrorBoundary, mergeProps } from "solid-js";
export * from "./server-mock.js";
export declare const isServer = false;
export declare const hydrate: typeof hydrateCore;
/**
 * renders components somewhere else in the DOM
 *
 * Useful for inserting modals and tooltips outside of an cropping layout. If no mount point is given, the portal is inserted in document.body; it is wrapped in a `<div>` unless the target is document.head or `isSVG` is true. setting `useShadow` to true places the element in a shadow root to isolate styles.
 *
 * @description https://www.solidjs.com/docs/latest/api#%3Cportal%3E
 */
export declare function Portal<T extends boolean = false, S extends boolean = false>(props: {
    mount?: Node;
    useShadow?: T;
    isSVG?: S;
    ref?: (S extends true ? SVGGElement : HTMLDivElement) | ((el: (T extends true ? {
        readonly shadowRoot: ShadowRoot;
    } : {}) & (S extends true ? SVGGElement : HTMLDivElement)) => void);
    children: JSX.Element;
}): Text;
declare type DynamicProps<T extends ValidComponent, P = ComponentProps<T>> = {
    [K in keyof P]: P[K];
} & {
    component: T | undefined;
};
/**
 * renders an arbitrary custom or native component and passes the other props
 * ```typescript
 * <Dynamic component={multiline() ? 'textarea' : 'input'} value={value()} />
 * ```
 * @description https://www.solidjs.com/docs/latest/api#%3Cdynamic%3E
 */
export declare function Dynamic<T extends ValidComponent>(props: DynamicProps<T>): Accessor<JSX.Element>;
