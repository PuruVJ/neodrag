<p align="center">
<a href="https://next.neodrag.dev"><img src="https://next.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/react
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight React hook to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/react"><img src="https://img.shields.io/npm/v/@neodrag/react?color=e63900&label="></a>
<p>

<p align="center"><a href="https://next.neodrag.dev/docs/react">Getting Started</a></p>

# Features

- 🤏 **Small in size** - ~5KB, plugin architecture enables tree-shaking
- 🧩 **Plugin-based** - Mix and match only what you need
- ⚡ **Performance** - Event delegation, pointer capture, optimized for modern browsers
- 🎯 **React Native** - Built for React hooks with `useDraggable`
- 🔄 **Reactive** - pass `() => plugins`; the wrapper reconciles automatically

# Installing

```bash
npm install @neodrag/react@next
```

# Usage

Basic usage

```tsx
import { useRef } from 'react';
import { useDraggable } from '@neodrag/react';

function App() {
	const draggableRef = useRef<HTMLDivElement>(null);
	useDraggable(draggableRef);

	return <div ref={draggableRef}>Hello</div>;
}
```

With plugins

```tsx
import { useRef } from 'react';
import { useDraggable, axis, grid } from '@neodrag/react';

function App() {
	const draggableRef = useRef<HTMLDivElement>(null);

	useDraggable(draggableRef, [axis('x'), grid([10, 10])]);

	return <div ref={draggableRef}>Hello</div>;
}
```

Defining plugins elsewhere with TypeScript

```tsx
import { useRef } from 'react';
import { useDraggable, axis, bounds, BoundsFrom, type Plugin } from '@neodrag/react';

function App() {
	const draggableRef = useRef<HTMLDivElement>(null);

	const plugins: Plugin[] = [axis('y'), bounds(BoundsFrom.parent())];
	useDraggable(draggableRef, plugins);

	return <div ref={draggableRef}>Hello</div>;
}
```

Getting drag state

```tsx
import { useRef, useEffect } from 'react';
import { useDraggable } from '@neodrag/react';

function App() {
	const draggableRef = useRef<HTMLDivElement>(null);
	const dragState = useDraggable(draggableRef);

	useEffect(() => {
		console.log('Position:', dragState.offset);
		console.log('Is dragging:', dragState.isDragging);
	}, [dragState]);

	return <div ref={draggableRef}>Hello</div>;
}
```

Reactive plugins with reactive plugin factories

```tsx
import { useRef, useState } from 'react';
import { useDraggable, axis } from '@neodrag/react';

function App() {
	const elementRef = useRef<HTMLDivElement>(null);
	const [currentAxis, setCurrentAxis] = useState<'x' | 'y'>('x');

	
	useDraggable(elementRef, () => [axisreactive plugin factories]);

	return (
		<div>
			<div ref={elementRef}>Current axis: {currentAxis}</div>
			<button onClick={() => setCurrentAxis(currentAxis === 'x' ? 'y' : 'x')}>Switch Axis</button>
		</div>
	);
}
```

<a href="https://next.neodrag.dev/docs/react" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired by [react-draggable](https://github.com/react-grid-layout/react-draggable), but with a modern plugin architecture and optimized for performance.

# License

MIT License © Puru Vijay
