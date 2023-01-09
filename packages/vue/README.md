<p align="center">
<a href="https://www.neodrag.dev"><img src="https://www.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/vue
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight Vue directive to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/vue"><img src="https://img.shields.io/npm/v/@neodrag/vue?color=42b883&label="></a>
<p>

<p align="center"><a href="https://www.neodrag.dev/docs/vue">Getting Started</a></p>

## Features

- 🤏 Tiny - Only 1.75KB min+brotli.
- 🐇 Simple - Quite simple to use, and effectively no-config required!
- 🧙‍♀️ Elegant - Vue directive, to keep the usage simple, elegant and straightforward.
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior.
- ⚛️ Reactive - Change options passed to it on the fly, it will **just work 🙂**

[Try it in Stackblitz](https://stackblitz.com/edit/vitejs-vite-2pg1r1?file=src%2FApp.jsx)

## Installing

```bash
pnpm add @neodrag/vue

# npm
npm install @neodrag/vue

# yarn
yarn add @neodrag/vue
```

## Usage

Basic usage

```vue
<script setup>
import { vDraggable } from '@neodrag/vue';
</script>

<template>
	<div v-draggable>I am draggable</div>
</template>
```

With options

```vue
<script setup>
import { vDraggable } from '@neodrag/vue';
</script>

<template>
	<div v-draggable="{ axis: 'x', grid: [10, 10] }">I am draggable</div>
</template>
```

Defining options elsewhere with typescript

```vue
<script setup lang="ts">
import { vDraggable, type DragOptions } from '@neodrag/vue';

const options: DragOptions = {
	axis: 'y',
	bounds: 'parent',
};
</script>

<template>
	<div v-draggable="options">I am draggable</div>
</template>
```

<a href="https://www.neodrag.dev/docs/vue"><h2>Read the docs</h2></a>

## Credits

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable) library, and implements a similar API, but 3x smaller.

# License

MIT License &copy; Puru Vijay
