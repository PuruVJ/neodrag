# svelte-fast-dimension

Fast [dimension bindings](https://svelte.dev/tutorial/dimensions) using ResizeObservers.

**Why?** Svelte currently uses an iframe technique to measure dimensions so it works in older browsers. However, creating multiple iframes has a big performance impact and sometimes [quirkiness](https://github.com/sveltejs/svelte/issues/4776). If your target browsers support [ResizeObserver](https://caniuse.com/resizeobserver), this can significantly improve dimension binding performance.

## Installation

```bash
npm install --save-dev svelte-fast-dimension
```

## Usage

```js
// svelte.config.js
import { fastDimension } from 'svelte-fast-dimension';

export default {
	preprocess: [fastDimension()]
};
```

Use dimension bindings as usual, it will use ResizeObservers under-the-hood:

```html
<script>
	let a, b, c, d;
</script>

<div
	bind:clientWidth="{a}"
	bind:clientHeight="{b}"
	bind:offsetWidth="{c}"
	bind:offsetHeight="{d}"
/>
```

## Recipes

### Using with svelte-preprocess

Due to how Svelte applies preprocessors, using this with `svelte-preprocess` needs a bit more work to make sure we run this preprocessor **only after** `svelte-preprocess` finishes. There's [an RFC](https://github.com/sveltejs/rfcs/pull/56) to make this process clearer soon.

At the meantime, you can try one of these libraries:

- [svelte-sequential-preprocessor](https://github.com/pchynoweth/svelte-sequential-preprocessor)
- [svelte-as-markup-preprocessor](https://github.com/firefish5000/svelte-as-markup-preprocessor)
- [My custom gist](https://gist.github.com/bluwy/5fc6f97768b7f065df4e2dbb1366db4c)

### Vite

`svelte-fast-dimension` injects an import from `svelte-fast-dimension/action` when preprocessing. This won't be detected during Vite's prebundling phase, and will cause on-the-fly prebundling which slows startup time. To remedy this, add `svelte-fast-dimension/action` to [optimizeDeps.include](https://vitejs.dev/config/#optimizedeps-include).

## License

[MIT](./LICENSE)
