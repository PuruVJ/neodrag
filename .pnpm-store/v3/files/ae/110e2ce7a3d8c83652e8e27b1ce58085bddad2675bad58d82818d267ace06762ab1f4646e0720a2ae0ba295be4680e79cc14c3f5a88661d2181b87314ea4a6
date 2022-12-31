import { ClassValue } from 'clsx';
import type { Properties as CSSProperties } from 'csstype';
/**
 * Svelte action to change class on `body`
 *
 * You can pass a string or object, or an array of combination of these. Literally anything that [clsx](https://github.com/lukeed/clsx) accepts.
 *
 * @example
 *
 *```svelte
 * <script>
 *   import { classList } from 'svelte-body';
 *
 *   let isBlue = true;
 * </script>
 *
 * <svelte:body use:classList={"red green blue"} />
 * <svelte:body use:classList={{ red: true, blue: isBlue }} />
 * <svelte:body use:classList={['red', isBlue && 'blue']} />
 * <svelte:body use:classList={[ 'red', { blue: isBlue } ]} />
 *```
 */
export declare const classList: (node: HTMLElement, classString?: string | ClassValue) => {
    update: (classString?: string | ClassValue) => void;
    destroy: () => void;
};
/**
 * Svelte action to add style on `body`. style can either be a string or an object.
 *
 * @example
 *
 *```svelte
 * <script>
 *   import { style } from 'svelte-body';
 * </script>
 *
 * <svelte:body use:style={"background-color: blue;"} />
 * <svelte:body use:style={{ backgroundColor: 'blue' }} />
 *```
 */
export declare const style: (node: HTMLElement, styleData?: CSSProperties | string) => {
    update: (styleData: any) => void;
    destroy: () => void;
};
