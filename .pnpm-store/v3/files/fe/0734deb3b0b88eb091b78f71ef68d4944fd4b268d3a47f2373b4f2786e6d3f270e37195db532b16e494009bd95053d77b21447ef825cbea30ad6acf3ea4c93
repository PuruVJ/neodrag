import { SvelteComponentTyped } from "svelte";
import type { ClassValue } from 'clsx';
import type { Properties as CSSProperties } from 'csstype';
declare const __propDef: {
    props: {
        /**
             * Svelte action to change class on `body`
             *
             * You can pass a string or object, or an array of combination of these. Literally anything that [clsx](https://github.com/lukeed/clsx) accepts.
             *
             * @example
             *
             *```svelte
             * <Body class="red green blue" />
             * <Body class={{ red: true, blue: false }} />
             * <Body class={['red', false && 'blue']} />
             * <Body class={[ 'red', { blue: true } ]} />
             * ```
             */ class?: string | ClassValue;
        /**
             * Svelte action to add style on `body`. style can either be a string or an object.
             *
             * @example
             *```svelte
             * <Body style={"background-color: blue;"} />
             * <Body style={{ backgroundColor: 'blue' }} />
             * ```
             */ style?: CSSProperties | string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type BodyProps = typeof __propDef.props;
export declare type BodyEvents = typeof __propDef.events;
export declare type BodySlots = typeof __propDef.slots;
export default class Body extends SvelteComponentTyped<BodyProps, BodyEvents, BodySlots> {
}
export {};
