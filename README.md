# svelte-drag

A lightweight Svelte Action to make your elements draggable.

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable) library, and implements the same API.

# Features

- 🤏 Tiny - Only [2KB](https://bundlephobia.com/package/svelte-drag) min+gzip.
- 🐇 Simple - Quite simple to use, and effectively no-config required!
- 🧙‍♀️ Elegant - Svelte Action, to keep the usage simple, elegant and expressive.
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior.
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
  import type { DragOptions } from 'svelte-drag';

  let options: DragOptions = {
    axis: 'y',
    bounds: 'parent',
  };
</script>

<div use:draggable={options}>Hello</div>
```

# Options

There's tons of options available for this package. All of them are already documented within the code itself, so you'll never have to leave the code editor.

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

**Note**: This library doesn't check whether the selector is bigger than the node element.
You yourself will have to make sure of that, or it may lead to unexpected behavior.

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
<div use:draggable={{ handle: '.handle' }}>
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

`on:svelte-drag:start`: `(e: CustomEvent<{offsetX: number; offsetY: number }>) => void`. Provides the initial offset when dragging starts, on the `e.detail` object.

`on:svelte-drag:`: `(e: CustomEvent<{offsetX: number; offsetY: number }>) => void`. Provides how far the element has been dragged from it's original position in `x` and `y` coordinates on the `event.detail` object

`on:svelte-drag:end`: `(e: CustomEvent<{offsetX: number; offsetY: number }>) => void`. No internal state provided to `event.detail`. Provides the final offset when dragging ends, on the `e.detail` object.

If you're a TypeScript user, read on below 👇

# TypeScript

The events above are custom events, and hence, not recognized by the TypeScript compiler, so your editor will basically yell at you and say these events do not exist. For that, you need to create a `types.d.ts` file in the `source` folder of your project and the code below to it 👇

```ts
export declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    'onsvelte-drag:start'?: (e: CustomEvent<{ offsetX: number; offsetY: number }>) => void;
    'onsvelte-drag:end'?: (e: CustomEvent<{ offsetX: number; offsetY: number }>) => void;
    'onsvelte-drag'?: (e: CustomEvent<{ offsetX: number; offsetY: number }>) => void;
  }
}
```

## Types Exported from package

This package exports these types you can use:

```ts
import type { DragAxis, DragBounds, DragBoundsCoords, DragOptions } from 'svelte-drag';
```

`DragOptions` is the documented list of all options provided by the component.

`DragAxis` is the type of `axis` option, and is equal to `'both' | 'x' | 'y' | 'none'`.

`DragBounds` is `'parent' | string | Partial<DragBoundsCoords>`, the complete type of `bounds` option.

`SDragBoundsCoords` is when you're specifying the `bounds` field using an object, this is the type needed for that.

```ts
export type DragBoundsCoords = {
  /** Number of pixels from left of the window */
  left: number;

  /** Number of pixels from top of the window */
  top: number;

  /** Number of pixels from the right side of window */
  right: number;

  /** Number of pixels from the bottom of the window */
  bottom: number;
};
```

# Why an action and not a component?

In case you're wondering why this library is an action, and not a component, the answer is simple: Actions usage is much much simpler and elegant than a component for this case could ever be.

If it were a component, its syntax would be like this 👇

```svelte
<Draggable axis="x" grid={[50, 50]}>
  <div>
    Hello
  </div>
</Draggable>
```

This is ok, but what if there are more than 2 elements at the top.

```svelte
<Draggable axis="x" grid={[50, 50]}>
  <div>
    Hello
  </div>

  <div>
    You shall not pass ~ Gandalf the wizard
  </div>
</Draggable>
```

This poses a problem: How would I decide which of these to make a draggable? Ofc, I could wrap the `<slot />` in a `<div>`, apply event listeners on it, set it to `display: contents`, but it would add an extra DOM element, and sometimes, that alone can make a huge difference!

So to not add a wrapper myself, I would need to write here in docs to pass only one root element, and give an error when I detect multiple. or I'd need to enforce passing the ref of the element into the component using `bind:this`, like this 👇

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

You'd have to bind the element ref which you want to make a draggable, and pass it to the component.

This is doable, but it adds an unnecessary amount of API layer, and the code isn't idiomatic and elegant, not to mention how much extra code I would have to add as the library author.

Not to mention, it would require much more work to make it SSR compliant, which makes no sense, cuz the server isn't dragging elements around, so why need to SSR it in the first place ¯\\\_(ツ)\_/¯. I would have to add `browser` checks everywhere to make it work, which is less than ideal.

On the other hand, as an action, this gives ultimate control to both the user and me.

```svelte
<div use:draggable={{ axis: 'x', grid: [50, 50] }}>
  Hello
</div>
```

This is extremely simple, elegant and expressive. By applying the action, you are specifying which element you want to be draggable, without any extra overhead. It just works!! And Actions aren't run in SSR, so your app will server render without errors caused from this library, and will spare me the gruelling task of adding browser checks everywhere!! It's a win win for everyone!! 🙂

# Contributing

Feel free to open an issue with a bug or feature request.

If you wish to make a PR fixing something, please open an issue about it first!

## Help needed 🛑

This library lacks something very important: **Automated Tests!**

I'll be straight about this: I don't know how to write tests. I've tried, but not been able to.

So I need your help. If you wish to contribute and can add tests here, it would be great for everyone using this! 🙂

Specifications here: [#7](https://github.com/PuruVJ/svelte-drag/issues/7)

# License

MIT License
