# @neodrag/react

A lightweight React hook to make your elements draggable.

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable) library, and implements a similar API, but 3x smaller.

# Features

- 🤏 Tiny - Only 2KB min+brotli.
- 🐇 Simple - Quite simple to use, and effectively no-config required!
- 🧙‍♀️ Elegant - React hook, to keep the usage simple, elegant and expressive.
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior.
- ⚛️ Reactive - Change options passed to it on the fly, it will **just work 🙂**

<!-- TODO [Try it in Stackblitz](https://svelte.dev/repl/fc972f90450c4945b6f2481d13eafa00?version=3.38.3) -->

# Installing

```bash
pnpm add @neodrag/react

# npm
npm install @neodrag/react

# yarn
yarn add @neodrag/react
```

# Usage

Basic usage

```tsx
import { useDraggable } from '@neodrag/react';

function App() {
	const draggableRef = useRef(null);
	useDraggable(draggableRef);

	return <div ref={draggableRef}>Hello</div>;
}
```

With options

```tsx
import { useDraggable } from '@neodrag/react';

function App() {
	const draggableRef = useRef(null);
	useDraggable(draggableRef, { axis: 'x', grid: [10, 10] });

	return <div ref={draggableRef}>Hello</div>;
}
```

Defining options elsewhere with typescript

```tsx
import { useDraggable, DragOptions } from '@neodrag/react';

function App() {
	const draggableRef = useRef(null);

	const options: DragOptions = {
		axis: 'y',
		bounds: 'parent',
	};

	useDraggable(draggableRef, options);

	return <div ref={draggableRef}>Hello</div>;
}
```

Getting state

```tsx
import { useDraggable } from '@neodrag/react';

function App() {
	const draggableRef = useRef(null);

	const { isDragging, dragState } = useDraggable(draggableRef);

	useEffect(() => {
		console.log({ isDragging, dragState });
	}, [isDragging, dragState]);

	return <div ref={draggableRef}>Hello</div>;
}
```

`dragState` is of type:

```ts
{
  /** Distance of element from original position on x-axis */
  offsetX: number,

  /** Distance of element from original position on y-axis */
  offsetY: number,

  /** element.getBoundingClientRect() result */
  domRect: DOMRect,
}
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

```tsx
useDraggable(draggableRef, { axis: 'x' });
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

```tsx
useDraggable(draggableRef, { bounds: document.querySelector('.some-element') });
```

Bound to parent

```tsx
useDraggable(draggableRef, { bounds: 'parent' });
```

Bound to body

```tsx
useDraggable(draggableRef, { bounds: 'body' });
```

Bound to an ancestor selector somewhere in page

```tsx
useDraggable(draggableRef, { bounds: '.way-up-in-the-dom' });
```

Manually through coordinates. Empty object means bound to the `window`.

**NOTE**: It isn't strictly empty object. If you omit any property from this object, it will be assumed as `0`.

```tsx
useDraggable(draggableRef, { bounds: {} });
```

Bound only to top and bottom, and unbounded horizontally in practice by setting bounds way beyond the screen.

```tsx
useDraggable(draggableRef, { bounds: { top: 0, bottom: 0, left: -1000, right: -1000 } });
```

## gpuAcceleration

**type**: `boolean`

**Default value**: `true`

If true, uses `translate3d` instead of `translate` to move the element around, and the hardware acceleration kicks in.

`true` by default, but can be set to `false` if [blurry text issue](https://developpaper.com/question/why-does-the-use-of-css3-translate3d-result-in-blurred-display/) occurs.

Example 👇

```tsx
useDraggable(draggableRef, { gpuAcceleration: false });
```

## applyUserSelectHack

**type**: `boolean`

**Default value**: `true`

Applies `user-select: none` on `<body />` element when dragging, to prevent the irritating effect where dragging doesn't happen and the text is selected. Applied when dragging starts and removed when it stops.

## ignoreMultitouch

**type**: `boolean`

**Default value**: `false`

Ignores touch events with more than 1 touch.
This helps when you have multiple elements on a canvas where you want to implement pinch-to-zoom behaviour.

```tsx
<!-- Ignore Multitouch -->
useDraggable(draggableRef, { ignoreMultitouch: true });
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

**type**: `string | HTMLElement`

**Default value**: `undefined`

CSS Selector of an element inside the parent node(on which `use:draggable` is applied). Can be an element too. If it is provided, Trying to drag inside the `cancel` selector will prevent dragging.

Selector:

```tsx
useDraggable(draggableRef, { cancel: '.cancel' });

return (
	<div ref={draggableRef}>
		This will drag!
		<div class="cancel">You shall not drag!!🧙‍♂️</div>
	</div>
);
```

Ref:

```tsx
const cancelRef = useRef(null);

useDraggable(draggableRef, { cancel: cancelRef.current });

return (
	<div ref={draggableRef}>
		This will drag!
		<div ref={cancelRef}>You shall not drag!!🧙‍♂️</div>
	</div>
);
```

## handle

**type**: `string | HTMLElement`

**Default Value**: `undefined`

CSS Selector of an element inside the parent node(on which `use:draggable` is applied). If it is provided, Only clicking and dragging on this element will allow the parent to drag, anywhere else on the parent won't work.

Selector:

```tsx
useDraggable(draggableRef, { handle: '.handle' });

return (
	<div ref={draggableRef}>
		You shall not drag!!🧙‍♂️
		<div class="handle">This will drag 😁</div>
	</div>
);
```

Ref:

```tsx
const handleRef = useRef(null);

useDraggable(draggableRef, { cancel: handleRef.current });

return (
	<div ref={draggableRef}>
		You shall not drag!!🧙‍♂️
		<div ref={handleRef}>This will drag 😁</div>
	</div>
);
```

## defaultClass

**type**: `string`

**Default Value**: `'neodrag'`

Class to apply on the element on which `draggable` is applied. <br/><br/> Note that if `handle` is provided, it will still apply class on the parent element, **NOT** the handle

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

**type**: `(data: { offsetX: number; offsetY: number, domRect: DOMRect }) => void`

**Default Value**: `undefined`

Fires when dragging start.

## onDrag

**type**: `(data: { offsetX: number; offsetY: number, domRect: DOMRect }) => void`

**Default Value**: `undefined`

Fires when dragging is going on.

## onDragEnd

**type**: `(data: { offsetX: number; offsetY: number, domRect: DOMRect }) => void`

**Default Value**: `undefined`

Fires when dragging ends.

# Events

`@neodrag/react` emits 3 events, `onDrag`, `onDragStart` & `onDragEnd`.

Example:

```tsx
useDraggable(draggableRef, {
	ignoreMultitouch: true,

	onDragStart: (data) => {
		console.log('onDragStart', data);
	},
	onDrag: (data) => {
		console.log('onDrag', data);
	},
	onDragEnd: (data) => {
		console.log('onDragEnd', data);
	},
});
```

## Types Exported from package

This package exports these types you can use:

```ts
import type { DragAxis, DragBounds, DragBoundsCoords, DragOptions } from '@neodrag/react';
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

# Controlled vs Uncontrolled

This is taken straight from React's philosophy.

Uncontrolled means your app doesn't control the dragging of the app. Meaning, the user drags the element, it changes position, and you do something with that action. You yourself don't change position of the element or anything. This is the default behavior of this library.

Controlled means your app, using state variables, changes the position of the element, or in simple terms, programmatically drag the element. You basically set the `position` property to `{ x: 10, y: 50 }`(or any other numbers), and voila! yur now controlling the position of the element programmatically 🥳🥳

OFC, this library doesn't go fully **Controlled**. The user can still drag it around even when `position` is set.

So, when you change `position`, the element position changes. However, when the element is dragged by user interaction, `position` is not changed. This is done intentionally, as two-way data binding here isn't possible and also will lead to unexpected behavior. To keep the `position` variable up to date, use the `on:neodrag` event to keep your state up to date to the draggable's internal state.

To have it be strictly **Controlled**, meaning it can only be moved programmatically, add the `disabled` option to your draggable element's config

```tsx
useDraggable(draggableRef, {
	position: { x: 0, y: 10 },
	disabled: true,
});
```

<!-- TODO
Here are a bunch of examples showing controlled behavior 👇

1. [Changing with inputs](https://svelte.dev/repl/e1e707358b37467ba272891715878a1d?version=3.44.1)
2. [Changing with Sliders](https://svelte.dev/repl/6b437a1cdbfc4c748520a72330c6395b?version=3.44.1)
3. [Draggable only through external state, not user input](https://svelte.dev/repl/0eae169f272e41ba9c07ef222ed2bf66?version=3.44.1)
4. [Comes back to original position after drag end](https://svelte.dev/repl/83d3aa8c5e154b7baf1a9c417c217d2e?version=3.44.1)
5. [Comes back to original position with transition](https://svelte.dev/repl/bc84ed4ca22f45acbc28de3e33199883?version=3.44.1)
-->

# Contributing

Feel free to open an issue with a bug or feature request.

If you wish to make a PR fixing something, please open an issue about it first!

# Tests

This library is in dire need of tests. If you're interested in contributing, please open an issue with test case or whole Pull request for adding those.

# License

MIT License
