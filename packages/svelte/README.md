<p align="center">
<a href="https://next.neodrag.dev"><img src="https://next.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/svelte
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight Svelte attachment to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/svelte"><img src="https://img.shields.io/npm/v/@neodrag/svelte?color=e63900&label="></a>
<p>

<p align="center"><a href="https://next.neodrag.dev/docs/svelte">Getting Started</a></p>

# Features

- 🤏 **Small in size** - ~5KB, plugin architecture enables tree-shaking
- 🧩 **Plugin-based** - Mix and match only what you need
- ⚡ **Performance** - Event delegation, pointer capture, optimized for modern browsers
- 🎯 **Svelte 5 native** - Spread `{...drag.target}` on the element
- 🔄 **Reactive** - Change options on the fly with compartments
- 🗃️ **Highly customizable** - Tons of plugins available

# Installing

```bash
npm install @neodrag/svelte@next
```

Requires Svelte 5.

# Usage

Basic usage

```svelte
<script>
  import { Draggable } from '@neodrag/svelte';

  const drag = new Draggable({ plugins: [] });
</script>

<div {...drag.target}>Hello</div>
```

With plugins and drag callbacks

```svelte
<script>
  import { Draggable } from '@neodrag/svelte';
  import { axis, grid } from '@neodrag/svelte/plugins';

  const drag = new Draggable({
    plugins: [axis('x'), grid([10, 10])],
    onDrag(data) {
      console.log(data.offset, data.input.kind);
    },
  });
</script>

<div {...drag.target}>Hello</div>
{#if drag.isDragging}Dragging…{/if}
```

Defining plugins elsewhere with TypeScript

```svelte
<script lang="ts">
  import { Draggable } from '@neodrag/svelte';
  import {
    axis,
    bounds,
    BoundsFrom,
    type Plugin,
  } from '@neodrag/svelte/plugins';

  let plugins: Plugin[] = [axis('y'), bounds(BoundsFrom.viewport())];
  const drag = new Draggable({ plugins });
</script>

<div {...drag.target}>Hello</div>
```

Reactive plugins with compartments

```svelte
<script>
  import { Draggable } from '@neodrag/svelte';
  import { axis } from '@neodrag/svelte/plugins';

  let currentAxis = $state('x');
  const drag = new Draggable({
    plugins: [() => [axis(currentAxis)]],
  });
</script>

<div {...drag.target}>
  Current axis: {currentAxis}
</div>
```

# License

MIT
