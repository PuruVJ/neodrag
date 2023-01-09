<p align="center">
<a href="https://www.neodrag.dev"><img src="https://www.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/react
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight React hook to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/react"><img src="https://img.shields.io/npm/v/@neodrag/react?color=0098b3&label="></a>
<p>

<p align="center"><a href="https://www.neodrag.dev/docs/react">Getting Started</a></p>

# Features

- 🤏 Tiny - Only 1.95KB min+brotli.
- 🐇 Simple - Quite simple to use, and effectively no-config required!
- 🧙‍♀️ Elegant - React hook, to keep the usage simple, elegant and expressive.
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior.
- ⚛️ Reactive - Change options passed to it on the fly, it will **just work 🙂**

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
import { useDraggable, type DragOptions } from '@neodrag/react';

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

<a href="https://www.neodrag.dev/docs/react" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable) library, and implements even more features with similar API, but 3.7x smaller.

# License

MIT License &copy; Puru Vijay
