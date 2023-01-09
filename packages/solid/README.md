<p align="center">
<a href="https://www.neodrag.dev"><img src="https://www.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/solid
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight SolidJS directive to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/solid"><img src="https://img.shields.io/npm/v/@neodrag/solid?color=2c4f7d&label="></a>
<p>

<p align="center"><a href="https://www.neodrag.dev/docs/solid">Getting Started</a></p>

# Features

- 🤏 Tiny - Only 1.75KB min+brotli.
- 🐇 Simple - Quite simple to use, and effectively no-config required!
- 🧙‍♀️ Elegant - SolidJS directive, to keep the usage simple, elegant and straightforward.
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior.
- ⚛️ Reactive - Change options passed to it on the fly, it will **just work 🙂**

# Installing

```bash
pnpm add @neodrag/solid

# npm
npm install @neodrag/solid

# yarn
yarn add @neodrag/solid
```

# Usage

Basic usage

```tsx
import { createDraggable } from '@neodrag/solid';

export const App: Component = () => {
	const { draggable } = createDraggable();

	return <div use:draggable>You can drag me</div>;
};
```

With options

```tsx
import { createDraggable } from '@neodrag/solid';

const { draggable } = createDraggable();

<div use:draggable={{ axis: 'x', grid: [10, 10] }}>I am draggable</div>;
```

Defining options elsewhere with typescript

```tsx
import { createDraggable, type DragOptions } from '@neodrag/solid';

const options: DragOptions = {
	axis: 'y',
	bounds: 'parent',
};

const { draggable } = createDraggable();

<div use:draggable={options}>I am draggable</div>;
```

Reactive options:

```tsx
import { createSignal } from 'solid-js';
import { createDraggable } from '@neodrag/solid';

const [options, setOptions] = createSignal({
	axis: 'y',
	bounds: 'parent',
});

<div use:draggable={options()}>I am draggable</div>;

// You can update `options` with `setOptions` anytime and it'll change. Neodrag will automatically update to the new options 😉
```

<a href="https://www.neodrag.dev/docs/solid" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable) library, and implements even more features with a similar API, but 3.7x smaller.

# License

MIT License &copy; Puru Vijay
