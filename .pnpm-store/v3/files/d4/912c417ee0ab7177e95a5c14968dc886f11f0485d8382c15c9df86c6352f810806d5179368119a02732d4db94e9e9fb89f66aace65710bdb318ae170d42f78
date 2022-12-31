// Whenever a ambient declaration changes, its number should be increased
// This way, we avoid the situation where multiple ambient versions of svelte2tsx
// are loaded and their declarations conflict each other
// See https://github.com/sveltejs/language-tools/issues/1059 for an example bug that stems from it

// -- start svelte-ls-remove --
declare module '*.svelte' {
    export default _SvelteComponent
}
// -- end svelte-ls-remove --

declare class Svelte2TsxComponent<
    Props extends {} = {},
    Events extends {} = {},
    Slots extends {} = {}
> {
    // svelte2tsx-specific
    /**
     * @internal This is for type checking capabilities only
     * and does not exist at runtime. Don't use this property.
     */
    $$prop_def: Props;
    /**
     * @internal This is for type checking capabilities only
     * and does not exist at runtime. Don't use this property.
     */
    $$events_def: Events;
    /**
     * @internal This is for type checking capabilities only
     * and does not exist at runtime. Don't use this property.
     */
    $$slot_def: Slots;
    // https://svelte.dev/docs#Client-side_component_API
    constructor(options: Svelte2TsxComponentConstructorParameters<Props>);
    /**
     * Causes the callback function to be called whenever the component dispatches an event.
     * A function is returned that will remove the event listener when called.
     */
    $on<K extends keyof Events & string>(event: K, handler: ((e: Events[K]) => any) | null | undefined): () => void;
    /**
     * Removes a component from the DOM and triggers any `onDestroy` handlers.
     */
    $destroy(): void;
    /**
     * Programmatically sets props on an instance.
     * `component.$set({ x: 1 })` is equivalent to `x = 1` inside the component's `<script>` block.
     * Calling this method schedules an update for the next microtask — the DOM is __not__ updated synchronously.
     */
    $set(props?: Partial<Props>): void;
    // From SvelteComponent(Dev) definition
    $$: any;
    $capture_state(): void;
    $inject_state(): void;
}

type _SvelteComponent<Props=any,Events=any,Slots=any> = typeof import("svelte") extends {SvelteComponentTyped: any} ? import("svelte").SvelteComponentTyped<Props,Events,Slots> : Svelte2TsxComponent<Props,Events,Slots>;

interface Svelte2TsxComponentConstructorParameters<Props extends {}> {
    /**
     * An HTMLElement to render to. This option is required.
     */
    target: Element | ShadowRoot;
    /**
     * A child of `target` to render the component immediately before.
     */
    anchor?: Element;
    /**
     * An object of properties to supply to the component.
     */
    props?: Props;
    context?: Map<any, any>;
    hydrate?: boolean;
    intro?: boolean;
    $$inline?: boolean;
}

type AConstructorTypeOf<T, U extends any[] = any[]> = new (...args: U) => T;
type SvelteComponentConstructor<T, U extends Svelte2TsxComponentConstructorParameters<any>> = new (options: U) => T;

type SvelteActionReturnType = {
	update?: (args: any) => void,
	destroy?: () => void
} | void

type SvelteTransitionConfig = {
    delay?: number,
    duration?: number,
    easing?: (t: number) => number,
    css?: (t: number, u: number) => string,
    tick?: (t: number, u: number) => void
}

type SvelteTransitionReturnType = SvelteTransitionConfig | (() => SvelteTransitionConfig)

type SvelteAnimationReturnType = {
    delay?: number,
    duration?: number,
    easing?: (t: number) => number,
    css?: (t: number, u: number) => string,
    tick?: (t: number, u: number) => void
}

type SvelteWithOptionalProps<Props, Keys extends keyof Props> = Omit<Props, Keys> & Partial<Pick<Props, Keys>>;
type SvelteAllProps = { [index: string]: any }
type SveltePropsAnyFallback<Props> = {[K in keyof Props]: Props[K] extends never ? never : Props[K] extends undefined ? any : Props[K]}
type SvelteSlotsAnyFallback<Slots> = {[K in keyof Slots]: {[S in keyof Slots[K]]: Slots[K][S] extends undefined ? any : Slots[K][S]}}
type SvelteRestProps = { [index: string]: any }
type SvelteSlots = { [index: string]: any }
type SvelteStore<T> = { subscribe: (run: (value: T) => any, invalidate?: any) => any }

// Forces TypeScript to look into the type which results in a better representation of it
// which helps for error messages and is necessary for d.ts file transformation so that
// no ambient type references are left in the output
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type KeysMatching<Obj, V> = {[K in keyof Obj]-?: Obj[K] extends V ? K : never}[keyof Obj]
declare type __sveltets_1_CustomEvents<T> = {[K in KeysMatching<T, CustomEvent>]: T[K] extends CustomEvent ? T[K]['detail']: T[K]}

declare var process: NodeJS.Process & { browser: boolean }
declare var __sveltets_1_AnimationMove: { from: DOMRect, to: DOMRect }

declare function __sveltets_1_ensureAnimation(animationCall: SvelteAnimationReturnType): {};
declare function __sveltets_1_ensureAction(actionCall: SvelteActionReturnType): {};
declare function __sveltets_1_ensureTransition(transitionCall: SvelteTransitionReturnType): {};
declare function __sveltets_1_ensureFunction(expression: (e: Event & { detail?: any }) => unknown ): {};
// Includes undefined and null for all types as all usages also allow these
declare function __sveltets_1_ensureType<T>(type: AConstructorTypeOf<T>, el: T | undefined | null): {};
declare function __sveltets_1_ensureType<T1, T2>(type1: AConstructorTypeOf<T1>, type2: AConstructorTypeOf<T2>, el: T1 | T2 | undefined | null): {};

declare function __sveltets_1_createEnsureSlot<Slots = Record<string, Record<string, any>>>(): <K1 extends keyof Slots, K2 extends keyof Slots[K1]>(k1: K1, k2: K2, val: Slots[K1][K2]) => Slots[K1][K2];
declare function __sveltets_1_ensureRightProps<Props>(props: Props): {};
declare function __sveltets_1_cssProp(prop: Record<string, any>): {};
declare function __sveltets_1_ctorOf<T>(type: T): AConstructorTypeOf<T>;
declare function __sveltets_1_instanceOf<T = any>(type: AConstructorTypeOf<T>): T;
declare function __sveltets_1_allPropsType(): SvelteAllProps
declare function __sveltets_1_restPropsType(): SvelteRestProps
declare function __sveltets_1_slotsType<Slots, Key extends keyof Slots>(slots: Slots): Record<Key, boolean>;

// Overload of the following two functions is necessary.
// An empty array of optionalProps makes OptionalProps type any, which means we lose the prop typing.
// optionalProps need to be first or its type cannot be infered correctly.

declare function __sveltets_1_partial<Props = {}, Events = {}, Slots = {}>(
    render: {props: Props, events: Events, slots: Slots }
): {props: Expand<SveltePropsAnyFallback<Props>>, events: Events, slots: Expand<SvelteSlotsAnyFallback<Slots>> }
declare function __sveltets_1_partial<Props = {}, Events = {}, Slots = {}, OptionalProps extends keyof Props = any>(
    optionalProps: OptionalProps[],
    render: {props: Props, events: Events, slots: Slots }
): {props: Expand<SvelteWithOptionalProps<SveltePropsAnyFallback<Props>, OptionalProps>>, events: Events, slots: Expand<SvelteSlotsAnyFallback<Slots>> }

declare function __sveltets_1_partial_with_any<Props = {}, Events = {}, Slots = {}>(
    render: {props: Props, events: Events, slots: Slots }
): {props: Expand<SveltePropsAnyFallback<Props> & SvelteAllProps>, events: Events, slots: Expand<SvelteSlotsAnyFallback<Slots>> }
declare function __sveltets_1_partial_with_any<Props = {}, Events = {}, Slots = {}, OptionalProps extends keyof Props = any>(
    optionalProps: OptionalProps[],
    render: {props: Props, events: Events, slots: Slots }
): {props: Expand<SvelteWithOptionalProps<SveltePropsAnyFallback<Props>, OptionalProps> & SvelteAllProps>, events: Events, slots: Expand<SvelteSlotsAnyFallback<Slots>> }


declare function __sveltets_1_with_any<Props = {}, Events = {}, Slots = {}>(
    render: {props: Props, events: Events, slots: Slots }
): {props: Expand<Props & SvelteAllProps>, events: Events, slots: Slots }

declare function __sveltets_1_with_any_event<Props = {}, Events = {}, Slots = {}>(
    render: {props: Props, events: Events, slots: Slots }
): {props: Props, events: Events & {[evt: string]: CustomEvent<any>;}, slots: Slots }

declare function __sveltets_1_store_get<T = any>(store: SvelteStore<T>): T
declare function __sveltets_1_store_get<Store extends SvelteStore<any> | undefined | null>(store: Store): Store extends SvelteStore<infer T> ? T : Store;
declare function __sveltets_1_any(dummy: any): any;
declare function __sveltets_1_empty(...dummy: any[]): {};
declare function __sveltets_1_componentType(): AConstructorTypeOf<_SvelteComponent<any, any, any>>
declare function __sveltets_1_invalidate<T>(getValue: () => T): T

declare function __sveltets_1_mapWindowEvent<K extends keyof HTMLBodyElementEventMap>(
    event: K
): HTMLBodyElementEventMap[K];
declare function __sveltets_1_mapBodyEvent<K extends keyof WindowEventMap>(
    event: K
): WindowEventMap[K];
declare function __sveltets_1_mapElementEvent<K extends keyof HTMLElementEventMap>(
    event: K
): HTMLElementEventMap[K];
declare function __sveltets_1_mapElementTag<K extends keyof ElementTagNameMap>(
    tag: K
): ElementTagNameMap[K];
declare function __sveltets_1_mapElementTag<K extends keyof SVGElementTagNameMap>(
    tag: K
): SVGElementTagNameMap[K];
declare function __sveltets_1_mapElementTag(
    tag: any
): any; // needs to be any because used in context of <svelte:element>

declare function __sveltets_1_bubbleEventDef<Events, K extends keyof Events>(
    events: Events, eventKey: K
): Events[K];
declare function __sveltets_1_bubbleEventDef(
    events: any, eventKey: string
): any;

declare const __sveltets_1_customEvent: CustomEvent<any>;
declare function __sveltets_1_toEventTypings<Typings>(): {[Key in keyof Typings]: CustomEvent<Typings[Key]>};

declare function __sveltets_1_unionType<T1, T2>(t1: T1, t2: T2): T1 | T2;
declare function __sveltets_1_unionType<T1, T2, T3>(t1: T1, t2: T2, t3: T3): T1 | T2 | T3;
declare function __sveltets_1_unionType<T1, T2, T3, T4>(t1: T1, t2: T2, t3: T3, t4: T4): T1 | T2 | T3 | T4;
declare function __sveltets_1_unionType(...types: any[]): any;

declare function __sveltets_1_awaitThen<T>(
    promise: T,
    onfulfilled: (value: T extends PromiseLike<infer U> ? U : T) => any,
    onrejected?: (value: T extends PromiseLike<any> ? any : never) => any
): any;

declare function __sveltets_1_each<T extends ArrayLike<unknown>>(
    array: T,
    callbackfn: (value: T extends ArrayLike<infer U> ? U : any, index: number) => any
): any;

declare function __sveltets_1_createSvelte2TsxComponent<Props, Events, Slots>(
    render: {props: Props, events: Events, slots: Slots }
): SvelteComponentConstructor<_SvelteComponent<Props, Events, Slots>,Svelte2TsxComponentConstructorParameters<Props>>;

declare function __sveltets_1_unwrapArr<T>(arr: ArrayLike<T>): T
declare function __sveltets_1_unwrapPromiseLike<T>(promise: PromiseLike<T> | T): T

// v2
declare function __sveltets_2_createCreateSlot<Slots = Record<string, Record<string, any>>>(): <SlotName extends keyof Slots>(slotName: SlotName, attrs: Slots[SlotName]) => Record<string, any>;
declare function __sveltets_2_createComponentAny(props: Record<string, any>): _SvelteComponent<any, any, any>;

declare function __sveltets_2_any(...dummy: any[]): any;
declare function __sveltets_2_empty(...dummy: any[]): {};
declare function __sveltets_2_union<T1,T2,T3,T4,T5>(t1:T1,t2?:T2,t3?:T3,t4?:T4,t5?:T5): T1 & T2 & T3 & T4 & T5;
declare function __sveltets_2_nonNullable<T>(type: T): NonNullable<T>;

declare function __sveltets_2_cssProp(prop: Record<string, any>): {};

type __sveltets_2_SvelteAnimationReturnType = {
    delay?: number,
    duration?: number,
    easing?: (t: number) => number,
    css?: (t: number, u: number) => string,
    tick?: (t: number, u: number) => void
}
declare var __sveltets_2_AnimationMove: { from: DOMRect, to: DOMRect }
declare function __sveltets_2_ensureAnimation(animationCall: __sveltets_2_SvelteAnimationReturnType): {};

type __sveltets_2_SvelteActionReturnType = {
	update?: (args: any) => void,
	destroy?: () => void,
    $$_attributes?: Record<string, any>,
} | void
declare function __sveltets_2_ensureAction<T extends __sveltets_2_SvelteActionReturnType>(actionCall: T): T extends  {$$_attributes?: any} ? T['$$_attributes'] : {};

type __sveltets_2_SvelteTransitionConfig = {
    delay?: number,
    duration?: number,
    easing?: (t: number) => number,
    css?: (t: number, u: number) => string,
    tick?: (t: number, u: number) => void
}
type __sveltets_2_SvelteTransitionReturnType = __sveltets_2_SvelteTransitionConfig | (() => __sveltets_2_SvelteTransitionConfig)
declare function __sveltets_2_ensureTransition(transitionCall: __sveltets_2_SvelteTransitionReturnType): {};

// Includes undefined and null for all types as all usages also allow these
declare function __sveltets_2_ensureType<T>(type: AConstructorTypeOf<T>, el: T | undefined | null): {};
declare function __sveltets_2_ensureType<T1, T2>(type1: AConstructorTypeOf<T1>, type2: AConstructorTypeOf<T2>, el: T1 | T2 | undefined | null): {};

// The following is necessary because there are two clashing errors that can't be solved at the same time
// when using Svelte2TsxComponent, more precisely the event typings in
// __sveltets_2_ensureComponent<T extends new (..) => _SvelteComponent<any,||any||<-this,any>>(type: T): T;
// If we type it as "any", we have an error when using sth like {a: CustomEvent<any>}
// If we type it as "{}", we have an error when using sth like {[evt: string]: CustomEvent<any>}
// If we type it as "unknown", we get all kinds of follow up errors which we want to avoid
// Therefore introduce two more base classes just for this case.
/**
 * Ambient type only used for intellisense, DO NOT USE IN YOUR PROJECT
 */
declare type ATypedSvelteComponent = {
    /**
     * @internal This is for type checking capabilities only
     * and does not exist at runtime. Don't use this property.
     */
    $$prop_def: any;
    /**
     * @internal This is for type checking capabilities only
     * and does not exist at runtime. Don't use this property.
     */
    $$events_def: any;
    /**
     * @internal This is for type checking capabilities only
     * and does not exist at runtime. Don't use this property.
     */
    $$slot_def: any;

    $on(event: string, handler: ((e: any) => any) | null | undefined): () => void;
}
/**
 * Ambient type only used for intellisense, DO NOT USE IN YOUR PROJECT.
 * 
 * If you're looking for the type of a Svelte Component, use `SvelteComponentTyped` and `ComponentType` instead:
 *
 * ```ts
 * import type { ComponentType, SvelteComponentTyped } from "svelte";
 * let myComponentConstructor: ComponentType<SvelteComponentTyped> = ..;
 * ```
 */
declare type ConstructorOfATypedSvelteComponent = new (args: {target: any, props?: any}) => ATypedSvelteComponent
declare function __sveltets_2_ensureComponent<T extends ConstructorOfATypedSvelteComponent | null | undefined>(type: T): NonNullable<T>;

declare function __sveltets_2_ensureArray<T extends ArrayLike<unknown>>(array: T): T extends ArrayLike<infer U> ? U[] : any[];
