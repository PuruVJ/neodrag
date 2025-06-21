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
  <a href="https://www.npmjs.com/package/@neodrag/vue"><img src="https://img.shields.io/npm/v/@neodrag/vue?color=e63900&label="></a>
<p>

<p align="center"><a href="https://www.neodrag.dev/docs/vue">Getting Started</a></p>

# Features

- 🤏 **Small in size** - ~5KB, plugin architecture enables tree-shaking
- 🧩 **Plugin-based** - Mix and match only what you need
- ⚡ **Performance** - Event delegation, pointer capture, optimized for modern browsers
- 🎯 **Vue 3 Native** - Built for Vue 3 composition API with `v-draggable` directive
- 🔄 **Reactive** - `useCompartment` for reactive plugin updates

# Installing

```bash
npm install @neodrag/vue@next
```

# Usage

Basic usage

```vue
<script setup>
import { vDraggable } from '@neodrag/vue';
</script>

<template>
	<div v-draggable>I am draggable</div>
</template>
```

With plugins

```vue
<script setup>
import { vDraggable, axis, grid } from '@neodrag/vue';
</script>

<template>
	<div v-draggable="[axis('x'), grid([10, 10])]">I am draggable</div>
</template>
```

Defining plugins elsewhere with TypeScript

```vue
<script setup lang="ts">
import { vDraggable, axis, grid, type Plugin } from '@neodrag/vue';

const plugins: Plugin[] = [axis('y'), grid([10, 10])];
</script>

<template>
	<div v-draggable="plugins">I am draggable</div>
</template>
```

Reactive plugins with useCompartment

```vue
<script setup>
import { ref } from 'vue';
import { vDraggable, axis, useCompartment } from '@neodrag/vue';

const currentAxis = ref('x');
const axisComp = useCompartment(() => axis(currentAxis.value));

const plugins = () => [axisComp];
</script>

<template>
	<div>
		<div v-draggable="plugins">Current axis: {{ currentAxis }}</div>
		<button @click="currentAxis = currentAxis === 'x' ? 'y' : 'x'">Switch Axis</button>
	</div>
</template>
```

<a href="https://www.neodrag.dev/docs/vue" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired by [react-draggable](https://github.com/react-grid-layout/react-draggable), but with a modern plugin architecture and optimized for performance.

# License

MIT License © Puru Vijay
