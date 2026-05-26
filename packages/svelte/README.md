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
- 🎯 **Svelte 5 native** - Built for attachments with `{@attach}` syntax
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

	const drag_0 = new Draggable({ plugins:  });
	const drag_1 = new Draggable({ plugins: [axis('x'), grid([10, 10])] });
	const drag_2 = new Draggable({ plugins: plugins });
	const drag_3 = new Draggable({ plugins: [() => [axisComp]] });
</script>

<div {@attach drag_0.attachment}>Hello</div>
```

With plugins

```svelte
<script>
  import { Draggable } from '@neodrag/svelte'
	import { axis, grid } from '@neodrag/svelte/plugins';
</script>

<div {@attach drag_1.attachment}>
  Hello
</div>
```

Defining plugins elsewhere with TypeScript

```svelte
<script lang="ts">
  import { Draggable } from '@neodrag/svelte'
	import { axis, bounds, BoundsFrom, type Plugin } from '@neodrag/svelte/plugins';

  let plugins: Plugin[] = [
    axis('y'),
    bounds(BoundsFrom.viewport()),
  ];
</script>

<div {@attach drag_2.attachment}>Hello</div>
```

Reactive plugins with compartments

```svelte
<script>
  import { Draggable } from '@neodrag/svelte'
	import { axis } from '@neodrag/svelte/plugins';

  let currentAxis = $state('x');
  </script>

<div {@attach drag_3.attachment}>
  Current axis: {currentAxis}
</div>

<button onclick={() => (currentAxis = currentAxis === 'x' ? 'y' : 'x')}>
  Switch Axis
</button>
```

<a href="https://next.neodrag.dev/docs/svelte" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired by [react-draggable](https://github.com/react-grid-layout/react-draggable), but with a modern plugin architecture and optimized for performance.

# License

MIT License © Puru Vijay
