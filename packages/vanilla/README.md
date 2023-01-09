<p align="center">
<a href="https://www.neodrag.dev"><img src="https://www.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/vanilla
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight vanillaJS library to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/vanilla"><img src="https://img.shields.io/npm/v/@neodrag/vanilla?color=fff&label="></a>
<p>

<p align="center"><a href="https://www.neodrag.dev/docs/vanilla">Getting Started</a></p>

# Features

- 🤏 Tiny - Only 1.79KB min+brotli.
- 🐇 Simple - Quite simple to use, and effectively no-config required!
- 🧙‍♀️ Elegant - Single class, very easy to use.
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior.
- ⚛️ Reactive - Change options passed to it on the fly, it will **just work 🙂**

# Installing

```bash
pnpm add @neodrag/vanilla

# npm
npm install @neodrag/vanilla

# yarn
yarn add @neodrag/vanilla
```

# Usage

Basic usage

```tsx
import { Draggable } from '@neodrag/vanilla';

const dragInstance = new Draggable(document.querySelector('#drag'));
```

With options

```tsx
import { Draggable } from '@neodrag/vanilla';

const dragInstance = new Draggable(document.querySelector('#drag'), {
	axis: 'x',
	grid: [10, 10],
});
```

Defining options elsewhere with typescript

```tsx
import { type Draggable } from '@neodrag/vanilla';

const options: DragOptions = {
	axis: 'y',
	bounds: 'parent',
};

const dragInstance = new Draggable(document.querySelector('#drag'), options);
```

Update options:

```ts
import { Draggable } from '@neodrag/vanilla';

const dragInstance = new Draggable(document.querySelector('#drag'), {
	axis: 'x',
	grid: [10, 10],
});

// Update the specific options. Will be merged with the existing options.
dragInstance.update({
	axis: 'y',
});

// Completely overrides existing options, in this case, the `grid` property is removed
dragInstance.options = {
	axis: 'y',
};
```

<a href="https://www.neodrag.dev/docs/vanilla" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable) library, and implements even more features with a similar API, but 3.7x smaller.

# License

MIT License &copy; Puru Vijay
