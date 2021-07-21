# svelte-drag

A lightweight Svelte Action to make your elements draggable.

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable), and implements same APIs.

# Features

- 🤏 Tiny - Only [1.7KB](https://bundlephobia.com/package/svelte-drag) min+gzip
- 🐇 Simple - Available as Svelte Action for very simple usage
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior
- ⚛️ Reactive - Change options passed to it on the fly, it will **just work 🙂**

[Try it in Svelte REPL](https://svelte.dev/repl/fc972f90450c4945b6f2481d13eafa00?version=3.38.3)

# Installing

```bash
npm install svelte-drag

# If you're a Yarn person
yarn add svelte-drag
```

# Usage

Basic usage

```svelte
<script>
  import { draggable } from 'svelte-drag';
</script>

<div use:draggable>Hello</div>
```

With options

```svelte
<script>
  import { draggable } from 'svelte-drag';
</script>

<div use:draggable={{ axis: 'x', grid: [10, 10] }}>Hello</div>
```

Defining options elsewhere with typescript

```svelte
<script lang="ts">
  import { draggable } from 'svelte-drag';
  import type { SvelteDragOptions } from 'svelte-drag';

  let options: SvelteDragOptions = {
    axis: 'y',
    bounds: 'parent',
  };
</script>

<div use:draggable={options}>Hello</div>
```

# Options

There's tons of options available for this package. All of them are already documented within the code itself, so you'd never have to leave the code editor.

## axis

**type**: `'both' | 'x' | 'y' | 'none'`

**Default Value**: `'both'`

Axis on which the element can be dragged on. Valid values: `both`, `x`, `y`, `none`.

- `both` - Element can move in any direction
- `x` - Only horizontal movement possible
- `y` - Only vertical movement possible
- `none` - No movement at all

**Examples**:

```svelte
<!-- Drag only in x direction -->
<div use:draggable={{ axis: 'x' }}>Text</div>
```

Dynamically change `axis` using radio buttons.

```svelte
<script>
let axis;
</script>

<div>
  Axis:
  <label>
    <input type="radio" bind:group={axis} value="both" />
    Both
  </label>
  <label>
    <input type="radio" bind:group={axis} value="x" />
    x
  </label>
  <label>
    <input type="radio" bind:group={axis} value="y" />
    y
  </label>
  <label>
    <input type="radio" bind:group={axis} value="none" />
    none
  </label>
</div>

<!-- Dynamically change axis -->
<div use:draggable={{ axis }}>Text</div>
```

## bounds

**type**: `'parent' | string | { top?: number; right?: number; bottom?: number; left?: number }`

**Default Value**: `undefined`

Optionally limit the drag area

Accepts `parent` as prefixed value, and limits it to its parent.

Or, you can specify any selector and it will be bound to that.

**Note**: We don't check whether the selector is bigger than the node element.
You yourself will have to make sure of that, or it may lead to strange behavior

Or, finally, you can pass an object of type `{ top: number; right: number; bottom: number; left: number }`.
These mimic the css `top`, `right`, `bottom` and `left`, in the sense that `bottom` starts from the bottom of the window, and `right` from right of window.
If any of these properties are unspecified, they are assumed to be `0`.

**Examples**:

Bound to parent

```svelte
<div use:draggable={{ bounds: 'parent' }}>Hello</div>
```

Bound to body

```svelte
<div use:draggable={{ bounds: 'body' }}>Hello</div>
```

Bound to an ancestor selector somewhere in page

```svelte
<div use:draggable={{ bounds: '.way-up-in-the-dom' }}>Hello</div>
```

Manually through coordinates. Empty object means bound to the `window`.

**NOTE**: It isn't strictly empty object. If you omit any property from this object, it will be assumed as `0`.

```svelte
<div use:draggable={{ bounds: {} }}>Hello</div>
```

Bound only to top and bottom, and unbounded horizontally in practice by setting bounds way beyond the screen.

```svelte
<div use:draggable={{ bounds: { top: 0, bottom: 0, left: -1000, right: -1000 } }}>Hello</div>
```

## gpuAcceleration

**type**: `boolean`

**Default value**: `true`

If true, uses `translate3d` instead of `translate` to move the element around, and the hardware acceleration kicks in.

`true` by default, but can be set to `false` if [blurry text issue](https://developpaper.com/question/why-does-the-use-of-css3-translate3d-result-in-blurred-display/) occurs.

Example 👇

```svelte
<div use:draggable={{ gpuAcceleration: false }}>Hello</div>
```

## applyUserSelectHack

**type**: `boolean`

**Default value**: `true`

Applies `user-select: none` on `<body />` element when dragging, to prevent the irritating effect where dragging doesn't happen and the text is selected. Applied when dragging starts and removed when it stops.

## disabled

**type**: `boolean`

**Default Value**: `undefined`

Disables dragging.

## grid

**type**: `[number, number]`

**Default value**: `undefined`

Applies a grid on the page to which the element snaps to when dragging, rather than the default continuous grid.

`Note`: If you're programmatically creating the grid, do not set it to [0, 0] ever, that will stop drag at all. Set it to `undefined` to make it continuous once again.

## cancel

**type**: `string`

**Default value**: `undefined`

CSS Selector of an element inside the parent node(on which `use:draggable` is applied). If it is provided, Trying to drag inside the `cancel` selector will prevent dragging.

```svelte
<div use:draggable={{ cancel: '.cancel' }}>
  This will drag!
  <div class="cancel">You shall not drag!!🧙‍♂️</div>
</div>
```

## handle

**type**: `string`

**Default Value**: `undefined`

CSS Selector of an element inside the parent node(on which `use:draggable` is applied). If it is provided, Only clicking and dragging on this element will allow the parent to drag, anywhere else on the parent won't work.

```svelte
<div use:draggable={{ cancel: '.cancel' }}>
  You shall not drag!!🧙‍♂️
  <div class="handle">This will drag 😁</div>
</div>
```

## defaultClass

**type**: `string`

**Default Value**: `'svelte-draggable'`

Class to apply on the element on which `use:draggable` is applied. <br/><br/> Note that if `handle` is provided, it will still apply class on the parent element, **NOT** the handle

## defaultClassDragging

**type**: `string`

**Default Value**: `'svelte-draggable-dragging'`

Class to apply on the parent element when it is dragging

## defaultClassDragged

**type**: `string`

**Default Value**: `'svelte-draggable-dragged'`

Class to apply on the parent element if it has been dragged at least once.

## defaultPosition

**type**: `{ x: number; y: number }`

**Default Value**: `{ x: 0, y: 0 }`

Offsets your element to the position you specify in the very beginning. `x` and `y` should be in pixels

# Events

`svelte-drag` emits 3 events, `on:svelte-drag`, `on:svelte-drag:start` & `on:svelte-drag:end`. These are all custom events, and can be listened on the node the `use:draggable` is applied to

Example:

```svelte
<div
  use:draggable
  on:svelte-drag:start={(e) => console.log('Dragging started', e)}
  on:svelte-drag={(e) => console.log(e.detail)}
  on:svelte-drag:end={(e) => console.log('Dragging stopped', e)}
>
  Hello
</div>
```

Event signatures:

`on:svelte-drag:start`: `(event: CustomEvent<null>) => void`. No internal state provided to `event.detail`

`on:svelte-drag:`: `(event: CustomEvent<{x: number; y: number }>) => void`. Provides how far the element has been dragged from it's original position in `x` and `y` coordinates on the `event.detail` object

`on:svelte-drag:end`: `(event: CustomEvent<null>) => void`. No internal state provided to `event.detail`.

If you're a TypeScript user, read on below 👇

# TypeScript

The events above are custom events, and hence, not recognized by the TypeScript compiler, so your editor will basically yell at you and says these events do not exist. For that, you need to create a `types.d.ts` file in the `source` folder of your project and the code below to it 👇

```ts
declare namespace svelte.JSX {
  interface HTMLAttributes {
    'onsvelte-drag:start'?: (e: CustomEvent<null>) => void;
    'onsvelte-drag:end'?: (e: CustomEvent<null>) => void;
    'ondrag-drag'?: (e: CustomEvent<{ x: number; y: number }>) => void;
  }
}
```

Due to a bug in our pipeline, these types can't be included automatically. We'll soon be able to remove this step for you 😊

## Types Exported from package

This package exports 2 types you can use:

```ts
import type { SvelteDragOptions, SvelteDragBoundsCoords } from 'svelte-drag';
```

`SvelteDragOptions` is the documented list of all options provided by the component.

`SvelteDragAxis` is the type of `axis` option, and is equal to `'both' | 'x' | 'y' | 'none'`.

`SvelteDragBounds` is `'parent' | string | Partial<SvelteDragBoundsCoords>`, the complete type of `bounds` option.

`SvelteDragBoundsCoords` is when you're specifying the `bounds` field using an object, this is the type needed for that.

```ts
export type SvelteDragBoundsCoords = {
  /** Number of pixels from left of the document */
  left: number;

  /** Number of pixels from top of the document */
  top: number;

  /** Number of pixels from the right side of document */
  right: number;

  /** Number of pixels from the bottom of the document */
  bottom: number;
};
```

# Why an action and not a component?

In case you're wondering why this library is an action, and not a component, the answer is simple: Actions usage is much much simpler than component.

If it were a component, it's syntax would be like this 👇

```svelte
<script>
let ref;
</script>

<Draggable nodeRef={ref} axis="x" grid={[50, 50]}>
  <div bind:this={ref}>
    Hello
  </div>
</Draggable>
```

You'd have to bind the element ref which you wanna make draggable and pass it to the component. This would be necessary, for it would be near impossible for the component to determine which element is the draggable, in-case multiple root elements were provided. This is simple enough, but adds more complexity for user as well as me, the library author.

Not to mention, it would require much more work to make it SSR compliant, which makes no sense, cuz the server isn't dragging elements around, so why need to SSR it in the first place. I'd have to add `browser` checks everywhere to make it work, which is less than ideal.

On the other hand, as an action, this gives ultimate control to both the user and me.

```svelte
<div use:draggable>
  Hello
</div>
```

This is extremely simple and expressive. By applying the action, you are specifying which element you want keep draggable, without any extra overhead. It just works. And Actions aren't run in SSR, so your app will Server render without errors caused from this library, and will spare me the gruelling task of adding browser checks everywhere!! It's a win win for everyone!! 🙂

# Contributing

Feel free to open an issue with a bug or feature request.

If you wish to make a PR fixing something, please open an issue about it first!

# License

MIT License
