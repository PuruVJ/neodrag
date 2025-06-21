# @neodrag/react

## 3.0.0-next.0

### Major Changes

- [#182](https://github.com/PuruVJ/neodrag/pull/182) [`8ca8f37`](https://github.com/PuruVJ/neodrag/commit/8ca8f379c9ead112045d6d833da9675dd0926165) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Neodrag v3: Completely rewritten from scratch, with a new architecture and a new API.

### Patch Changes

- [#182](https://github.com/PuruVJ/neodrag/pull/182) [`326f18e`](https://github.com/PuruVJ/neodrag/commit/326f18ea389dd3b8afc4a0f919ee6fae32d60906) Thanks [@PuruVJ](https://github.com/PuruVJ)! - fix: transform plugin now works if offset are 0

- [#182](https://github.com/PuruVJ/neodrag/pull/182) [`1477cae`](https://github.com/PuruVJ/neodrag/commit/1477cae4ad966898d6f89e41e7721eaaf17c1e6f) Thanks [@PuruVJ](https://github.com/PuruVJ)! - fix: Bounds calculation now takes viewport position into account

- [#182](https://github.com/PuruVJ/neodrag/pull/182) [`3fb258f`](https://github.com/PuruVJ/neodrag/commit/3fb258fed11721fb56a48732462f9b8326e8da46) Thanks [@PuruVJ](https://github.com/PuruVJ)! - (fix) Use html tag as delegateTarget

- [#182](https://github.com/PuruVJ/neodrag/pull/182) [`1477cae`](https://github.com/PuruVJ/neodrag/commit/1477cae4ad966898d6f89e41e7721eaaf17c1e6f) Thanks [@PuruVJ](https://github.com/PuruVJ)! - fix: position plugin does nothing if isDragging

- [#182](https://github.com/PuruVJ/neodrag/pull/182) [`4c5b86b`](https://github.com/PuruVJ/neodrag/commit/4c5b86b0c0ed461a142d4919d59e0d062da6936a) Thanks [@PuruVJ](https://github.com/PuruVJ)! - fix: apply neodrag class on action init, not pointerdown

- Updated dependencies [[`326f18e`](https://github.com/PuruVJ/neodrag/commit/326f18ea389dd3b8afc4a0f919ee6fae32d60906), [`1477cae`](https://github.com/PuruVJ/neodrag/commit/1477cae4ad966898d6f89e41e7721eaaf17c1e6f), [`3fb258f`](https://github.com/PuruVJ/neodrag/commit/3fb258fed11721fb56a48732462f9b8326e8da46), [`8ca8f37`](https://github.com/PuruVJ/neodrag/commit/8ca8f379c9ead112045d6d833da9675dd0926165), [`1477cae`](https://github.com/PuruVJ/neodrag/commit/1477cae4ad966898d6f89e41e7721eaaf17c1e6f), [`4c5b86b`](https://github.com/PuruVJ/neodrag/commit/4c5b86b0c0ed461a142d4919d59e0d062da6936a)]:
  - @neodrag/core@3.0.0-next.0

## 2.3.0

### Minor Changes

- [#186](https://github.com/PuruVJ/neodrag/pull/186) [`a917373`](https://github.com/PuruVJ/neodrag/commit/a917373e56378ae9443f3162e428abc8c058b191) Thanks [@PuruVJ](https://github.com/PuruVJ)! - feat: Expose event: PointerEvent

## 2.2.0

### Minor Changes

- [#176](https://github.com/PuruVJ/neodrag/pull/176) [`0cead87`](https://github.com/PuruVJ/neodrag/commit/0cead8701f132670bd5618ceeb8fdee8e9a3ad27) Thanks [@PuruVJ](https://github.com/PuruVJ)! - deprecate: legacyTranslate and gpuAcceleration

## 2.1.0

### Minor Changes

- [#174](https://github.com/PuruVJ/neodrag/pull/174) [`45d9eeb`](https://github.com/PuruVJ/neodrag/commit/45d9eeb375b18eb0530cc079613dcdc21cce81d4) Thanks [@PuruVJ](https://github.com/PuruVJ)! - feat: threshold option

- [#172](https://github.com/PuruVJ/neodrag/pull/172) [`ac0e10b`](https://github.com/PuruVJ/neodrag/commit/ac0e10bf287b3577fb926d6ba585e906abeaab72) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Use AbortSignal for unregistering event listeners

### Patch Changes

- [#174](https://github.com/PuruVJ/neodrag/pull/174) [`45d9eeb`](https://github.com/PuruVJ/neodrag/commit/45d9eeb375b18eb0530cc079613dcdc21cce81d4) Thanks [@PuruVJ](https://github.com/PuruVJ)! - fix: drag end no longer causes onclick to trigger.

## 2.0.4

### Patch Changes

- [#145](https://github.com/PuruVJ/neodrag/pull/145) [`e19ce73`](https://github.com/PuruVJ/neodrag/commit/e19ce732a9494dc3eb05e0c8702cd802abc0af9a) Thanks [@PuruVJ](https://github.com/PuruVJ)! - fix: ignoreMultitouch now behaves correctly

## 2.0.3

### Patch Changes

- [#111](https://github.com/PuruVJ/neodrag/pull/111) [`b736fa6`](https://github.com/PuruVJ/neodrag/commit/b736fa689e06491e348638311900900e35342e6e) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Fix finding elements inside shadow DOM, not just the root

## 2.0.2

### Patch Changes

- [#108](https://github.com/PuruVJ/neodrag/pull/108) [`0e6a36a`](https://github.com/PuruVJ/neodrag/commit/0e6a36a8ab1be01b97d8604dbc931c6e7ce4f16b) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Fix usage inside Shadow DOM

## 2.0.1

### Patch Changes

- Fix canMoveInY bug in `dragEnd` function

## 2.0.0

### Minor Changes

- Allow refs in handle and cancel

### Patch Changes

- [#95](https://github.com/PuruVJ/neodrag/pull/95) [`3c10f6ae`](https://github.com/PuruVJ/neodrag/commit/3c10f6ae377c3e9fc9fea963ea99204a4649806c) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Add `legacyTranslate` option, remove memoization code, align to browser's RAF throttling

- [#97](https://github.com/PuruVJ/neodrag/pull/97) [`9e5c4647`](https://github.com/PuruVJ/neodrag/commit/9e5c46477c7781bc75a57944983434a0c8ceff77) Thanks [@PuruVJ](https://github.com/PuruVJ)! - New output formats

- [`da98e910`](https://github.com/PuruVJ/neodrag/commit/da98e910469d63e53e2462e74196bad3b90ea053) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Expose rootNode and currentNode from events. Remove node and domRect

- [#99](https://github.com/PuruVJ/neodrag/pull/99) [`a1572bce`](https://github.com/PuruVJ/neodrag/commit/a1572bce5186051a5114dd580017a49fc2b3c7fc) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Add transform function

- [`8dd0d88f`](https://github.com/PuruVJ/neodrag/commit/8dd0d88ff0458c0bd6d20e3649371fdf732c9ebb) Thanks [@PuruVJ](https://github.com/PuruVJ)! - Add recomputeBounds option

- [`ca8cde25`](https://github.com/PuruVJ/neodrag/commit/ca8cde252e555cc50a0919a295d01ec340207f8e) Thanks [@PuruVJ](https://github.com/PuruVJ)! Expose rootNode and currentNode from events. Remove node and domRect

- [`2ea2bad4`](https://github.com/PuruVJ/neodrag/commit/2ea2bad4f16e798fb0ecb55f8554efcd2e50ca26) Thanks [@PuruVJ](https://github.com/PuruVJ)! Fix ouble click issue

- Fix behavior when snap provided as 0

## 1.0.1

### Patch Changes

- Fix snapping while scaled
