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
  import { draggable } from '@neodrag/svelte';
</script>

<div {@attach draggable()}>Hello</div>
```

With plugins

```svelte
<script>
  import { draggable, axis, grid } from '@neodrag/svelte';
</script>

<div {@attach draggable([axis('x'), grid([10, 10])])}>
  Hello
</div>
```

Defining plugins elsewhere with TypeScript

```svelte
<script lang="ts">
  import { draggable, axis, bounds, BoundsFrom, type Plugin } from '@neodrag/svelte';

  let plugins: Plugin[] = [
    axis('y'),
    bounds(BoundsFrom.viewport()),
  ];
</script>

<div {@attach draggable(plugins)}>Hello</div>
```

Reactive plugins with compartments

```svelte
<script>
  import { draggable, axis, Compartment } from '@neodrag/svelte';

  let currentAxis = $state('x');
  const axisComp = Compartment.of(() => axis(currentAxis));
</script>

<div {@attach draggable(() => [axisComp])}>
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
