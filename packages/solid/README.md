<p align="center">
<a href="https://next.neodrag.dev"><img src="https://next.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/solid
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight SolidJS library to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/solid"><img src="https://img.shields.io/npm/v/@neodrag/solid?color=e63900&label="></a>
<p>

<p align="center"><a href="https://next.neodrag.dev/docs/solid">Getting Started</a></p>

# Features

- 🤏 **Small in size** - ~5KB, plugin architecture enables tree-shaking
- 🧩 **Plugin-based** - Mix and match only what you need
- ⚡ **Performance** - Event delegation, pointer capture, optimized for modern browsers
- 🎯 **SolidJS Native** - `createDraggable`, `createDroppable`, `createSortable` follow Solid naming (`create*` / `with*`)
- 🔄 **Reactive** - pass `() => plugins`; the wrapper reconciles automatically

# Installing

```bash
npm install @neodrag/solid@next
```

# Usage

Basic usage

```tsx
import { createDraggable } from '@neodrag/solid';

export const App: Component = () => {
  const [draggableRef, setDraggableRef] =
    createSignal<HTMLElement | null>(null);

  createDraggable(draggableRef);

  return <div ref={setDraggableRef}>You can drag me</div>;
};
```

With plugins

```tsx
import { createDraggable, axis, grid } from '@neodrag/solid';

export const App: Component = () => {
  const [draggableRef, setDraggableRef] =
    createSignal<HTMLElement | null>(null);

  createDraggable(draggableRef, [axis('x'), grid([10, 10])]);

  return <div ref={setDraggableRef}>Horizontal grid snapping</div>;
};
```

Defining plugins elsewhere with TypeScript

```tsx
import {
  createDraggable,
  axis,
  bounds,
  BoundsFrom,
  type Plugin,
} from '@neodrag/solid';

export const App: Component = () => {
  const [draggableRef, setDraggableRef] =
    createSignal<HTMLElement | null>(null);

  const plugins: Plugin[] = [axis('y'), bounds(BoundsFrom.parent())];
  createDraggable(draggableRef, plugins);

  return <div ref={setDraggableRef}>Type-safe dragging</div>;
};
```

Getting drag state

```tsx
import { createDraggable } from '@neodrag/solid';

export const App: Component = () => {
  const [draggableRef, setDraggableRef] =
    createSignal<HTMLElement | null>(null);
  const dragState = createDraggable(draggableRef);

  createEffect(() => {
    console.log('Position:', dragState().offset);
    console.log('Is dragging:', dragState().isDragging);
  });

  return (
    <div ref={setDraggableRef}>Check console while dragging</div>
  );
};
```

Reactive plugins with reactive plugin factories

```tsx
import { createSignal } from 'solid-js';
import { createDraggable, axis } from '@neodrag/solid';

export const App: Component = () => {
	const [draggableRef, setDraggableRef] = createSignal<HTMLElement | null>(null);
	const [currentAxis, setCurrentAxis] = createSignal<'x' | 'y'>('x');


	createDraggable(draggableRef, [axisreactive plugin factories]);

	return (
		<div>
			<div ref={setDraggableRef}>Current axis: {currentAxis()}</div>
			<button onClick={() => setCurrentAxis(currentAxis() === 'x' ? 'y' : 'x')}>Switch Axis</button>
		</div>
	);
};
```

## Sortable lists

```tsx
import { createSortable, createSortableItem } from '@neodrag/solid/sortable';

const { list, dropRef } = createSortable({
  items,
  keyBy: (i) => i.id,
  onReorder: setItems,
});

// <ul ref={dropRef}> … createSortableItem(list, item.id) per row
```

<a href="https://next.neodrag.dev/docs/solid" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired by [react-draggable](https://github.com/react-grid-layout/react-draggable), but with a modern plugin architecture and optimized for performance.

# License

MIT License © Puru Vijay
