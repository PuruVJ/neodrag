<p align="center">
<a href="https://www.neodrag.dev"><img src="https://www.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/core
</h1>

<h2 align="center">
The engine that powers all Neodrag implementations
</h2>

<p align="center">The foundational drag functionality through a plugin-based architecture.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/core"><img src="https://img.shields.io/npm/v/@neodrag/core?color=e63900&label="></a>
<p>

<p align="center"><a href="https://www.neodrag.dev/docs/core">Getting Started</a></p>

# Features

- 🤏 **Small in size** - ~5KB, plugin architecture enables tree-shaking
- 🧩 **Plugin-based** - Modular system for drag behaviors
- ⚡ **Performance** - Event delegation with only 3 global listeners
- 🎯 **Framework agnostic** - Powers Svelte, React, Vue, Solid, and Vanilla implementations
- 🔄 **Reactive** - Compartments for dynamic plugin updates
- 🛡️ **Type-safe** - Full TypeScript support with comprehensive error handling

# Installing

```bash
npm install @neodrag/core@next
```

# Usage

Basic usage

```typescript
import { DraggableFactory, DEFAULTS } from '@neodrag/core';
import { axis, grid } from '@neodrag/core/plugins';

const factory = new DraggableFactory(DEFAULTS);

// Create draggable with plugins
const dragInstance = factory.draggable(element, [axis('x'), grid([10, 10])]);

// Clean up when done
dragInstance.destroy();
```

With compartments for reactivity

```typescript
import { Compartment } from '@neodrag/core';

const axisCompartment = new Compartment(() => axis('x'));

const dragInstance = factory.draggable(element, [axisCompartment.current, grid([10, 10])]);

// Update axis dynamically
axisCompartment.current = () => axis('y');
```

Error handling

```typescript
const factory = new DraggableFactory({
	...DEFAULTS,
	onError: (error) => {
		console.error(`Error in ${error.phase} phase:`, error.error);
		if (error.plugin) {
			console.error(`Plugin: ${error.plugin.name}, Hook: ${error.plugin.hook}`);
		}
	},
});
```

Available plugins

```typescript
import {
	axis,
	bounds,
	BoundsFrom,
	grid,
	events,
	controls,
	ControlFrom,
	disabled,
	threshold,
	touchAction,
	transform,
} from '@neodrag/core/plugins';

const plugins = [
	axis('x'),
	bounds(BoundsFrom.viewport()),
	grid([20, 20]),
	events({
		start: (ctx) => console.log('Drag started'),
		drag: (ctx) => console.log('Dragging'),
		end: (ctx) => console.log('Drag ended'),
	}),
];
```

<a href="https://www.neodrag.dev/docs/core" style="font-size: 2rem">Read the docs</a>

## Framework Integration

This core powers all framework-specific packages:

```typescript
// Svelte
import { draggable, axis } from '@neodrag/svelte';

// React
import { useDraggable, axis } from '@neodrag/react';

// Vue
import { vDraggable, axis } from '@neodrag/vue';

// Solid
import { useDraggable, axis } from '@neodrag/solid';

// Vanilla
import { Draggable, axis } from '@neodrag/vanilla';
```

# License

MIT License © Puru Vijay
