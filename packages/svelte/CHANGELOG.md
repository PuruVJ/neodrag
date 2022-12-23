# @neodrag/svelte

## 2.0.0

### Major Changes

- [#60](https://github.com/PuruVJ/neodrag/pull/60) [`f2d1130`](https://github.com/PuruVJ/neodrag/commit/f2d113052954b055fda7516919e4113bbde849d4) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Event data provides the root node

  ```js
  {
  	onDrag: ({ node }) => {
  		console.log(node);
  	};
  }
  ```

- Remove `@neodrag/svelte/globals` for typings.

If you have this in your `tsconfig.json`:

```json
{
	"compilerOptions": {
		"types": ["@neodrag/svelte/globals"]
	}
}
```

or in your `.d.ts` file:

```ts
/// <reference types="@neodrag/svelte/globals" />
```

Remove it. It is no longer needed.

### Patch Changes

- Fix behavior when snap provided as 0

## 1.2.4

### Patch Changes

- Fix snapping while scaled
