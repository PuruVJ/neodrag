<p align="center">
<a href="https://next.neodrag.dev"><img src="https://next.neodrag.dev/logo.svg" height="150" /></a>
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

<p align="center"><a href="https://next.neodrag.dev/docs/vanilla">Getting Started</a></p>

# Features

- 🤏 **Small in size** - ~5KB, plugin architecture enables tree-shaking
- 🧩 **Plugin-based** - Mix and match only what you need
- ⚡ **Performance** - Event delegation, pointer capture, optimized for modern browsers
- 🎯 **Framework agnostic** - Works with any JavaScript environment
- 🔄 **Reactive** - pass `() => plugins`; the binding reconciles on `update()`

# Installing

```bash
npm install @neodrag/vanilla@next
```

# Usage

Create a `Draggable` binding, then attach it to a node. By default it uses the shared engine (`Neodrag.shared`) under the hood — you do not need to touch the engine for typical apps.

### Basic

```typescript
import { Draggable } from '@neodrag/vanilla';

const drag = new Draggable({ plugins: [] });
drag.attach(document.querySelector('#drag')!);

// later
drag.destroy();
```

### With plugins

```typescript
import { Draggable } from '@neodrag/vanilla';
import { axis, grid } from '@neodrag/vanilla/plugins';

const drag = new Draggable({
  plugins: [axis('x'), grid([10, 10])],
});
drag.attach(document.querySelector('#drag')!);
```

### Plugins defined elsewhere (TypeScript)

```typescript
import { Draggable, type DragPluginList } from '@neodrag/vanilla';
import { axis, bounds, BoundsFrom } from '@neodrag/vanilla/plugins';

const plugins: DragPluginList = [axis('y'), bounds(BoundsFrom.parent())];

const drag = new Draggable({ plugins });
drag.attach(document.querySelector('#drag')!);
```

### Reactive plugins

```typescript
import { Draggable } from '@neodrag/vanilla';
import { axis } from '@neodrag/vanilla/plugins';

let currentAxis: 'x' | 'y' = 'x';

const drag = new Draggable({
  plugins: [() => axis(currentAxis)],
});
drag.attach(document.querySelector('#drag')!);

function switchAxis() {
  currentAxis = currentAxis === 'x' ? 'y' : 'x';
  drag.update();
}
```

### Drag callbacks

```typescript
import { Draggable } from '@neodrag/vanilla';

const drag = new Draggable({
  plugins: [],
  onDragStart: (data) => console.log('Started:', data.offset),
  onDrag: (data) => console.log('Dragging:', data.offset),
  onDragEnd: (data) => console.log('Ended:', data.offset),
});
drag.attach(document.querySelector('#drag')!);
```

## Sortable lists

```typescript
import { Draggable, Droppable } from '@neodrag/vanilla';
import { Sortable } from '@neodrag/vanilla/sortable';

const items = [{ id: 'a' }, { id: 'b' }];
const list = new Sortable({
  items: () => items,
  keyBy: (i) => i.id,
  onReorder: (next) => {
    items.length = 0;
    items.push(...next);
  },
});

const zone = new Droppable({ plugins: list.container() });
zone.attach(document.querySelector('ul')!);

for (const item of items) {
  const chip = new Draggable({ plugins: list.item(item.id) });
  chip.attach(document.querySelector(`[data-id="${item.id}"]`)!);
}
```

## Custom engine

Only when you need isolated defaults or error handling:

```typescript
import { Neodrag, Draggable } from '@neodrag/vanilla';
import { axis } from '@neodrag/vanilla/plugins';

const engine = new Neodrag({
  onError: (error) => console.error(error),
});

const drag = new Draggable({ plugins: [axis('x')], engine });
drag.attach(document.querySelector('#drag')!);

// engine.dispose(); // tears down all bindings on this engine
```

## Using via CDN

For quick prototyping or projects without build tools:

### Basic CDN usage

```html
<script src="https://unpkg.com/@neodrag/vanilla@next/dist/umd/index.js"></script>

<div id="drag">Drag me!</div>
<script>
  var drag = new NeoDrag.Draggable({ plugins: [] });
  drag.attach(document.getElementById('drag'));
</script>
```

Plugin helpers (`axis`, `grid`, etc.) are imported from `@neodrag/vanilla/plugins` in bundled apps. For CDN, load a build that includes the plugins you need or use `@neodrag/core` plugin URLs from your bundler.

<a href="https://next.neodrag.dev/docs/vanilla" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired by [react-draggable](https://github.com/react-grid-layout/react-draggable), but with a modern plugin architecture and optimized for performance.

# License

MIT License © Puru Vijay
