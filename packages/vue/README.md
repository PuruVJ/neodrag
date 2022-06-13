# @neodrag/vue

A lightweight Vue directive to make your elements draggable.

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable) library, and implements a similar API, but 3x smaller.

# Features

- 🤏 Tiny - Only 1.98KB min+brotli.
- 🐇 Simple - Quite simple to use, and effectively no-config required!
- 🧙‍♀️ Elegant - Vue directive, to keep the usage simple, elegant and straightforward.
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior.
- ⚛️ Reactive - Change options passed to it on the fly, it will **just work 🙂**

<!-- TODO [Try it in Stackblitz](https://svelte.dev/repl/fc972f90450c4945b6f2481d13eafa00?version=3.38.3) -->

# Installing

```bash
pnpm add @neodrag/vue

# npm
npm install @neodrag/vue

# yarn
yarn add @neodrag/vue
```

# Usage

Basic usage

```vue
<script setup>
import { vDraggable } from '@neodrag/vue';
</script>

<template>
	<div v-draggable>I am draggable</div>
</template>
```

With options

```vue
<script setup>
import { vDraggable } from '@neodrag/vue';
</script>

<template>
	<div v-draggable="{ axis: 'x', grid: [10, 10] }">I am draggable</div>
</template>
```

Defining options elsewhere with typescript

```vue
<script setup lang="ts">
import { vDraggable, type DragOptions } from '@neodrag/vue';

const options: DragOptions = {
	axis: 'y',
	bounds: 'parent',
};
</script>

<template>
	<div v-draggable="options">I am draggable</div>
</template>
```

# Options

There are tons of options available for this package. All of them are already documented within the code itself, so you'll never have to leave the code editor.

## axis

**type**: `'both' | 'x' | 'y' | 'none'`

**Default Value**: `'both'`

Axis on which the element can be dragged on. Valid values: `both`, `x`, `y`, `none`.

- `both` - Element can move in any direction
- `x` - Only horizontal movement possible
- `y` - Only vertical movement possible
- `none` - No movement at all

**Examples**:

```vue
<!-- Drag only in x direction -->
<div v-draggable="{ axis: 'x' }">Text</div>
```

## bounds

**type**: `HTMLElement | 'parent' | string | { top?: number; right?: number; bottom?: number; left?: number }`

**Default Value**: `undefined`

Optionally limit the drag area

`parent`: Limit to parent

Or, you can specify any selector and it will be bound to that.

**Note**: This library doesn't check whether the selector is bigger than the node element.
You yourself will have to make sure of that, or it may lead to unexpected behavior.

Or, finally, you can pass an object of type `{ top: number; right: number; bottom: number; left: number }`.
These mimic the css `top`, `right`, `bottom` and `left`, in the sense that `bottom` starts from the bottom of the window, and `right` from right of window.
If any of these properties are unspecified, they are assumed to be `0`.

**Examples**:

Bound to any element

```vue
<div v-draggable="{ bounds: document.querySelector('.some-element') }">Hello</div>
```

Bound to parent

```vue
<div v-draggable="{ bounds: 'parent' }">Hello</div>
```

Bound to body

```vue
<div v-draggable="{ bounds: 'body' }">Hello</div>
```

Bound to an ancestor selector somewhere in page

```vue
<div v-draggable="{ bounds: '.way-up-in-the-dom' }">Hello</div>
```

Manually through coordinates. Empty object means bound to the `window`.

**NOTE**: It isn't strictly empty object. If you omit any property from this object, it will be assumed as `0`.

```vue
<div v-draggable="{ bounds: {} }">Hello</div>
```

Bound only to top and bottom, and unbounded horizontally in practice by setting bounds way beyond the screen.

```vue
<div v-draggable="{ bounds: { top: 0, bottom: 0, left: -1000, right: -1000 } }">Hello</div>
```

## gpuAcceleration

**type**: `boolean`

**Default value**: `true`

If true, uses `translate3d` instead of `translate` to move the element around, and the hardware acceleration kicks in.

`true` by default, but can be set to `false` if [blurry text issue](https://developpaper.com/question/why-does-the-use-of-css3-translate3d-result-in-blurred-display/) occurs.

Example 👇

```vue
<div v-draggable="{ gpuAcceleration: false }">Hello</div>
```

## applyUserSelectHack

**type**: `boolean`

**Default value**: `true`

Applies `user-select: none` on `<body />` element when dragging, to prevent the irritating effect where dragging doesn't happen and the text is selected. Applied when dragging starts and removed when it stops.

```vue
<div v-draggable="{ applyUserSelectHack: false }">Text</div>
```

## ignoreMultitouch

**type**: `boolean`

**Default value**: `false`

Ignores touch events with more than 1 touch.
This helps when you have multiple elements on a canvas where you want to implement pinch-to-zoom behaviour.

```vue
<!-- Ignore Multitouch -->
<div v-draggable="{ ignoreMultitouch: true }">Text</div>
```

## disabled

**type**: `boolean`

**Default Value**: `undefined`

Disables dragging.

## grid

**type**: `[number, number]`

**Default value**: `undefined`

Applies a grid on the page to which the element snaps to when dragging, rather than the default continuous grid.

`Note`: If you're programmatically creating the grid, do not set it to [0, 0] ever, that will stop drag at all. Set it to `undefined` to make it continuous once again.

## position

**type**: `{ x: number; y: number }`

**Default Value**: `undefined`

Controls the position of the element programmatically. Fully reactive.

Read more below in the **Controlled vs Uncontrolled** section.

## cancel

**type**: `string | HTMLElement | HTMLElement[]`

**Default value**: `undefined`

CSS Selector of an element or multiple elements inside the parent node(on which `v-draggable` is applied). Can be an element or elements too. If it is provided, Trying to drag inside the `cancel` element(s) will prevent dragging.

Selector:

```vue
<template>
	<div v-draggable="{ cancel: '.cancel' }">
		This will drag!
		<div class="cancel">You shall not drag!!🧙‍♂️</div>
	</div>
</template>
```

Multiple elements with selector:

```vue
<template>
	<div v-draggable="{ cancel: '.cancel' }">
		This will drag!
		<div class="cancel">You shall not drag!!🧙‍♂️</div>
		<div class="cancel">You shall not drag too!!🧙‍♂️</div>
	</div>
</template>
```

Element:

```vue
<script setup>
import { vDraggable } from '@neodrag/vue';

const cancel = ref();
</script>

<template>
	<div v-draggable="{ cancel }">
		This will drag!
		<div class="cancel" ref="cancel">You shall not drag!!🧙‍♂️</div>
	</div>
</template>
```

Elements:

```vue
<script setup>
import { vDraggable } from '@neodrag/vue';

const cancel1 = ref();
const cancel2 = ref();
</script>

<template>
	<div v-draggable="{ cancel: [cancel1, cancel2] }">
		This will drag!
		<div class="cancel" ref="cancel1">Cancel me out</div>
		<div class="cancel" ref="cancel2">Cancel me out pt 2</div>
	</div>
</template>
```

## handle

**type**: `string | HTMLElement | HTMLElement[]`

**Default Value**: `undefined`

CSS Selector of an element or multiple elements inside the parent node(on which `v-draggable` is applied). Can be an element or elements too. If it is provided, Only clicking and dragging on this element will allow the parent to drag, anywhere else on the parent won't work.

```vue
<template>
	<div v-draggable="{ handle: '.handle' }">
		You shall not drag!!🧙‍♂️
		<div class="handle">This will drag 😁</div>
	</div>
</template>
```

Multiple handles with selector:

```vue
<template>
	<div v-draggable="{ handle: '.handle' }">
		You shall not drag!!🧙‍♂️
		<div class="handle">This will allow drag 😁</div>
		<div class="handle">This will allow drag too 😁</div>
		<div class="handle">This will allow drag three 😁</div>
	</div>
</template>
```

Handle with element:

```vue
<script setup>
import { vDraggable } from '@neodrag/vue';

const handle = ref();
</script>

<template>
	<div v-draggable="{ handle }">
		You shall not drag!!🧙‍♂️
		<div class="handle" ref="handle">This will drag 😁</div>
	</div>
</template>
```

Multiple handles with elements

```vue
<script setup>
import { vDraggable } from '@neodrag/vue';

const handle1 = ref();
const handle2 = ref();
const handle3 = ref();
</script>

<template>
	<div v-draggable="{ handle: [handle1, handle2, handle3] }">
		You shall not drag!!🧙‍♂️
		<div class="handle" ref="handle1">This will allow drag 😁</div>
		<div class="handle" ref="handle2">This will allow drag too 😁</div>
		<div class="handle" ref="handle3">This will allow drag three 😁</div>
	</div>
</template>
```

## defaultClass

**type**: `string`

**Default Value**: `'neodrag'`

Class to apply on the element on which `v-draggable` is applied. <br/><br/> Note that if `handle` is provided, it will still apply class on the parent element, **NOT** the handle

## defaultClassDragging

**type**: `string`

**Default Value**: `'neodrag-dragging'`

Class to apply on the parent element when it is dragging

## defaultClassDragged

**type**: `string`

**Default Value**: `'neodrag-dragged'`

Class to apply on the parent element if it has been dragged at least once.

## defaultPosition

**type**: `{ x: number; y: number }`

**Default Value**: `{ x: 0, y: 0 }`

Offsets your element to the position you specify in the very beginning. `x` and `y` should be in pixels

## onDragStart

**type**: `(data: DragEventData) => void`

**Default Value**: `undefined`

Fires when dragging start.

**Note**:

```ts
type DragEventData = { offsetX: number; offsetY: number; domRect: DOMRect };
```

## onDrag

**type**: `(data: DragEventData) => void`

**Default Value**: `undefined`

Fires when dragging is going on.

**Note**:

```ts
type DragEventData = { offsetX: number; offsetY: number; domRect: DOMRect };
```

## onDragEnd

**type**: `(data: DragEventData) => void`

**Default Value**: `undefined`

Fires when dragging ends.

**Note**:

```ts
type DragEventData = { offsetX: number; offsetY: number; domRect: DOMRect };
```

# Events

`@neodrag/vue` emits 3 events, `onDrag`, `onDragStart` & `onDragEnd`.
Example:

```vue
<template>
	<div
		v-draggable="{
			onDragStart: (data) => console.log('Dragging started', data),
			onDrag: (data) => console.log('Dragging', data),
			onDragEnd: (data) => console.log('Dragging stopped', data),
		}"
	>
		Hello
	</div>
</template>
```

# TypeScript

This library ships with proper TypeScript typings, for the best Developer Experience, whether authoring JS or TS.

Or, add to `tsconfig.json`:

## Types Exported from package

This package exports these types you can use:

```ts
import type {
	DragAxis,
	DragBounds,
	DragBoundsCoords,
	DragOptions,
	DragEventData,
} from '@neodrag/vue';
```

`DragOptions` is the documented list of all options provided by the component.

`DragAxis` is the type of `axis` option, and is equal to `'both' | 'x' | 'y' | 'none'`.

`DragBounds` is `'parent' | string | Partial<DragBoundsCoords>`, the complete type of `bounds` option.

`DragBoundsCoords` is when you're specifying the `bounds` field using an object, this is the type needed for that.

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

```ts
type DragEventData = {
	offsetX: number;
	offsetY: number;
	domRect: DOMRect;
};
```

# Controlled vs Uncontrolled

This is taken straight from React's philosophy(After all, this package is inspired from [react-draggable](https://github.com/react-grid-layout/react-draggable)).

Uncontrolled means your app doesn't control the dragging of the app. Meaning, the user drags the element, it changes position, and you do something with that action. You yourself don't change position of the element or anything. This is the default behavior of this library.

Controlled means your app, using state variables, changes the position of the element, or in simple terms, programmatically drag the element. You basically set the `position` property to `{ x: 10, y: 50 }`(or any other numbers), and voila! yur now controlling the position of the element programmatically 🥳🥳

OFC, this library doesn't go fully **Controlled**. The user can still drag it around even when `position` is set.

So, when you change `position`, the element position changes. However, when the element is dragged by user interaction, `position` is not changed. This is done intentionally, as two-way data binding here isn't possible and also will lead to unexpected behavior. To keep the `position` variable up to date, use the `onDrag` event to keep your state up to date to the draggable's internal state.

To have it be strictly **Controlled**, meaning it can only be moved programmatically, add the `disabled` option to your draggable element's config

```vue
<div v-draggable="{ position: { x: 0, y: 10 }, disabled: true }" />
```

Here are a bunch of examples showing controlled behavior 👇

# Contributing

Feel free to open an issue with a bug or feature request.

If you wish to make a PR fixing something, please open an issue about it first!

## Help needed 🛑

This library lacks something very important: **Automated Tests!**

I'll be straight about this: I don't know how to write tests. I've tried, but not been able to.

So I need your help. If you wish to contribute and can add tests here, it would be great for everyone using this! 🙂. There are already some tests but it could benefit from more test cases

Specifications here: [#7](https://github.com/PuruVJ/neodrag/issues/7)

# License

MIT License &copy; Puru Vijay
