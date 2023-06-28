<p align="center">
<a href="https://www.neodrag.dev"><img src="https://www.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/angular
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight Angular directive to make your elements draggable.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/angular"><img src="https://img.shields.io/npm/v/@neodrag/angular?color=2c4f7d&label="></a>
<p>

<p align="center"><a href="https://www.neodrag.dev/docs/angular">Getting Started</a></p>

# Features

- 🤏 Tiny - Only 1.75KB min+brotli.
- 🐇 Simple - Quite simple to use, and effectively no-config required!
- 🧙‍♀️ Elegant - Angular directive, to keep the usage simple, elegant and straightforward.
- 🗃️ Highly customizable - Offers tons of options that you can modify to get different behavior.
- ⚛️ Reactive - Change options passed to it on the fly, it will **just work 🙂**

# Installing

```bash
pnpm add @neodrag/angular

# npm
npm install @neodrag/angular

# yarn
yarn add @neodrag/angular
```

# Usage

Basic usage

```html
<div neoDraggable>You can drag me</div>
```

```ts
import { NeoDraggable } from '@neodrag/angular';

@Component({
	templateUrl: 'my-cmp.html',
	imports: [NeoDraggable],
})
export class MyCmp {}
```

With options

```html
<div [neoDraggable]="{ axis: 'y', bounds: 'parent' }">You can drag me</div>
```

```ts
import { NeoDraggable } from '@neodrag/angular';

@Component({
	templateUrl: 'my-cmp.html',
	imports: [NeoDraggable],
})
export class MyCmp {}
```

Defining options elsewhere with typescript

```html
<div [neoDraggable]="options">You can drag me</div>
```

```ts
import { NeoDraggable, type DragOptions } from '@neodrag/angular';

@Component({
	templateUrl: 'my-cmp.html',
	imports: [NeoDraggable],
})
export class MyCmp {
	options: DragOptions = {
		axis: 'y',
		bounds: 'parent',
	};
}
```

Reactive options:

```html
<div [neoDraggable]="options()">You can drag me</div>
```

```ts
import { NeoDraggable, type DragOptions } from '@neodrag/angular';

@Component({
	templateUrl: 'my-cmp.html',
	imports: [NeoDraggable],
})
export class MyCmp {
	options = signal<DragOptions>({
		axis: 'y',
		bounds: 'parent',
	});
}
```

<a href="https://www.neodrag.dev/docs/angular" style="font-size: 2rem">Read the docs</a>

## Credits

Inspired from the amazing [react-draggable](https://github.com/react-grid-layout/react-draggable) library, and implements even more features with a similar API, but 3.7x smaller.

# License

MIT License &copy; Puru Vijay
