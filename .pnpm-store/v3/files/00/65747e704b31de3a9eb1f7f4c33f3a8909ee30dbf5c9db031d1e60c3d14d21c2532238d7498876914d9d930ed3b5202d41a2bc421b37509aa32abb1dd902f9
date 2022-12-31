<script >import { classList, style as styleAction } from './actions';
let classes = '';
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
 */
export { classes as class };
/**
 * Svelte action to add style on `body`. style can either be a string or an object.
 *
 * @example
 *```svelte
 * <Body style={"background-color: blue;"} />
 * <Body style={{ backgroundColor: 'blue' }} />
 * ```
 */
export let style = '';
</script>

<!-- Use actions to avoid code duplication and make svelte-body more reactive -->
<svelte:body use:classList={classes} use:styleAction={style} />
