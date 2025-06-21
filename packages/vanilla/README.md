<p align="center">
<a href="https://www.neodrag.dev"><img src="https://www.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/vanilla
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight library to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/vanilla"><img src="https://img.shields.io/npm/v/@neodrag/vanilla?color=e63900&label="></a>
<p>

<p align="center"><a href="https://www.neodrag.dev/docs/vanilla">Getting Started</a></p>

# Features

- 🤏 **Small in size** - ~5KB, plugin architecture enables tree-shaking
- 🧩 **Plugin-based** - Mix and match only what you need
- ⚡ **Performance** - Event delegation, pointer capture, optimized for modern browsers
- 🎯 **Framework agnostic** - Works with any JavaScript environment
- 🔄 **Reactive** - `Compartment` for reactive plugin updates

# Installing

```bash
npm install @neodrag/vanilla@next
```

# Usage

Basic usage

```typescript
import { Draggable } from '@neodrag/vanilla';

const dragInstance = new Draggable(document.querySelector('#drag'));
```

With plugins

```typescript
import { Draggable, axis, grid } from '@neodrag/vanilla';

const dragInstance = new Draggable(document.querySelector('#drag'), [axis('x'), grid([10, 10])]);
```

Defining plugins elsewhere with TypeScript

```typescript
import { Draggable, axis, bounds, BoundsFrom, type Plugin } from '@neodrag/vanilla';

const plugins: Plugin[] = [axis('y'), bounds(BoundsFrom.parent())];

const dragInstance = new Draggable(document.querySelector('#drag'), plugins);
```

Reactive plugins with Compartments

```typescript
import { Draggable, axis, Compartment } from '@neodrag/vanilla';

const axisCompartment = new Compartment(() => axis('x'));
const dragInstance = new Draggable(document.querySelector('#drag'), () => [axisCompartment]);

// Update the axisCompartment. Automatically applies to the drag instance
axisCompartment.current = axis('y');
```

Cleanup

```typescript
// Clean up when done
dragInstance.destroy();
```

## Using via CDN

For quick prototyping or projects without build tools:

### Basic CDN Usage

```html
<script src="https://unpkg.com/@neodrag/vanilla@next/dist/umd/index.js"></script>

<div id="drag">Drag me!</div>
<script>
	var dragInstance = new NeoDrag.Draggable(document.getElementById('drag'));
</script>
```

### CDN with Plugins

```html
<script src="https://unpkg.com/@neodrag/vanilla@next/dist/umd/index.js"></script>

<div id="constrained-drag">Constrained dragging</div>
<script>
	var constrainedInstance = new NeoDrag.Draggable(document.getElementById('constrained-drag'), [
		NeoDrag.axis('x'),
		NeoDrag.bounds(NeoDrag.BoundsFrom.parent()),
		NeoDrag.grid([20, 20]),
	]);
</script>
```

### CDN with Reactive Compartments

```html
<script src="https://unpkg.com/@neodrag/vanilla@next/dist/umd/index.js"></script>

<div id="reactive-drag">Reactive dragging</div>
<button onclick="switchAxis()">Switch Axis</button>

<script>
	var currentAxis = 'x';
	var axisCompartment = new NeoDrag.Compartment(() => NeoDrag.axis(currentAxis));

	var reactiveInstance = new NeoDrag.Draggable(document.getElementById('reactive-drag'), () => [
		axisCompartment,
	]);

	function switchAxis() {
		currentAxis = currentAxis === 'x' ? 'y' : 'x';
		axisCompartment.current = NeoDrag.axis(currentAxis);
	}
</script>
```

<a href="https://www.neodrag.dev/docs/vanilla" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired by [react-draggable](https://github.com/react-grid-layout/react-draggable), but with a modern plugin architecture and optimized for performance.

# License

MIT License © Puru Vijay
