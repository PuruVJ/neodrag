# @neodrag/vanilla

## 2.0.0-next.3

### Patch Changes

- [#95](https://github.com/PuruVJ/neodrag/pull/95) [`0f513db2`](https://github.com/PuruVJ/neodrag/commit/0f513db2c0a88ed03f0472311a03b6ae0e4f9483) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Add `legacyTranslate` option, remove memoization code, align to browser's RAF throttling

## 2.0.0-next.2

### Patch Changes

- [#92](https://github.com/PuruVJ/neodrag/pull/92) [`820307b`](https://github.com/PuruVJ/neodrag/commit/820307b9e2ed5884b2c4d167ba2f7ae2bad14f87) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Add recomputeBounds option

## 2.0.0-next.1

### Patch Changes

- [#90](https://github.com/PuruVJ/neodrag/pull/90) [`8d04e73`](https://github.com/PuruVJ/neodrag/commit/8d04e7327c81ad345610bdc87bcf0f8b6a40fa9e) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Switch to pointer events

## 2.0.0-next.0

### Major Changes

- [#60](https://github.com/PuruVJ/neodrag/pull/60) [`f2d1130`](https://github.com/PuruVJ/neodrag/commit/f2d113052954b055fda7516919e4113bbde849d4) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Event data provides the root node

  ```js
  {
  	onDrag: ({ node }) => {
  		console.log(node);
  	};
  }
  ```

### Patch Changes

- Fix behavior when snap provided as 0

## 1.0.1

### Patch Changes

- Fix snapping while scaled
