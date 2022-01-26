# svelte-drag to @neodrag/svelte migration guide

## Installing

```bash
npm un svelte-drag
npm install @neodrag/svelte
```

And change the imports `import {draggable} from 'svelte-drag'` to `import {draggable} from '@neodrag/svelte'`

## Options

Options passed to the object are still the same as latest version of svelte-drag. No changes there

## Events

Events have been renamed

`on:svelte-drag` -> `on:neodrag`
`on:svelte-drag:start` -> `on:neodrag:start`
`on:svelte-drag:end` -> `on:neodrag:end`
