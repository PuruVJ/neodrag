export { createRoot, createSignal, createEffect, createRenderEffect, createComputed, createReaction, createDeferred, createSelector, createMemo, createResource, onMount, onCleanup, onError, untrack, batch, on, enableScheduling, enableExternalSource, startTransition, useTransition, createContext, useContext, children, getListener, getOwner, runWithOwner, equalFn, $DEVCOMP, $PROXY, $TRACK } from "./reactive/signal.js";
export type { Accessor, Setter, Signal, SignalOptions, Resource, ResourceActions, ResourceSource, ResourceOptions, ResourceReturn, ResourceFetcher, ResourceFetcherInfo, ChildrenReturn, Context, ReturnTypes, Owner, InitializedResource, InitializedResourceOptions, InitializedResourceReturn } from "./reactive/signal.js";
export * from "./reactive/observable.js";
export * from "./reactive/scheduler.js";
export * from "./reactive/array.js";
export * from "./render/index.js";
import type { JSX } from "./jsx.js";
declare type JSXElement = JSX.Element;
export type { JSXElement, JSX };
import { writeSignal, serializeGraph, registerGraph, hashValue } from "./reactive/signal.js";
declare let DEV: {
    writeSignal: typeof writeSignal;
    serializeGraph: typeof serializeGraph;
    registerGraph: typeof registerGraph;
    hashValue: typeof hashValue;
};
export { DEV };
declare global {
    var Solid$$: boolean;
}
