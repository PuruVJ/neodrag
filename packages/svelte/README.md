<p align="center">
<a href="https://www.neodrag.dev"><img src="https://www.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/svelte
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight Svelte action to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/svelte"><img src="https://img.shields.io/npm/v/@neodrag/svelte?color=e63900&label="></a>
<p>

<p align="center"><a href="https://www.neodrag.dev/docs/svelte">Getting Started</a></p>

# Features

- 🤏 Tiny - Only 1.68KB min+brotli.
- 🐇 Simple - Quite simple to use, and effectively no-config required!
- 🧙‍♀️ Elegant - Svelte Action, to keep the usage simple, elegant and expressive.
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior.
- ⚛️ Reactive - Change options passed to it on the fly, it will **just work 🙂**

[Try it in Svelte REPL](https://svelte.dev/repl/fc972f90450c4945b6f2481d13eafa00?version=3.38.3)

# Installing

```bash
pnpm add @neodrag/svelte

# npm
npm install @neodrag/svelte

# yarn
yarn add @neodrag/svelte
```

# Migrating from svelte-drag

svelte-drag is the predecessor of this package. To migrate, follow this short guide: [svelte-drag to @neodrag/svelte migration guide](https://www.neodrag.dev/docs/migrating/svelte-drag)

# Usage

Basic usage

```svelte
<script>
  import { draggable } from '@neodrag/svelte';
</script>

<div use:draggable>Hello</div>
```

With options

```svelte
<script>
  import { draggable } from '@neodrag/svelte';
</script>

<div use:draggable={{ axis: 'x', grid: [10, 10] }}>Hello</div>
```

Defining options elsewhere with typescript

```svelte
<script lang="ts">
  import { draggable, type DragOptions } from '@neodrag/svelte';

  let options: DragOptions = {
    axis: 'y',
    bounds: 'parent',
  };
</script>

<div use:draggable={options}>Hello</div>
```

<a href="https://www.neodrag.dev/docs/svelte" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable) library, and implements a similar API, but 3x smaller.

# License

MIT License &copy; Puru Vijay
