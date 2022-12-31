<div align="center">

# DeepmergeTS

[![npm version](https://img.shields.io/npm/v/deepmerge-ts.svg)](https://www.npmjs.com/package/deepmerge-ts)
[![deno version](https://img.shields.io/github/v/tag/RebeccaStevens/deepmerge-ts?label=deno&sort=semver)](https://deno.land/x/deepmergets)
[![CI](https://github.com/RebeccaStevens/deepmerge-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/RebeccaStevens/deepmerge-ts/actions/workflows/ci.yml)
[![Coverage Status](https://codecov.io/gh/RebeccaStevens/deepmerge-ts/branch/main/graph/badge.svg?token=MVpR1oAbIT)](https://codecov.io/gh/RebeccaStevens/deepmerge-ts)\
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![GitHub Discussions](https://img.shields.io/github/discussions/RebeccaStevens/deepmerge-ts?style=flat-square)](https://github.com/RebeccaStevens/deepmerge-ts/discussions)
[![BSD 3 Clause license](https://img.shields.io/github/license/RebeccaStevens/deepmerge-ts.svg?style=flat-square)](https://opensource.org/licenses/BSD-3-Clause)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

Deeply merge 2 or more objects respecting type information.

![classic merge animation](./assets/header.png)

</div>

## Donate

[Any donations would be much appreciated](./DONATIONS.md). 😄

## Installation

### Node

```sh
# Install with npm
npm install deepmerge-ts --save-dev

# Install with yarn
yarn add -D deepmerge-ts
```

### Deno

```jsonc
// import_map.json
{
  "imports": {
    "deepmerge-ts": "https://deno.land/x/deepmergets@__version__/dist/deno/index.ts"
  }
}
```

## Features

- Smart merging - High performance.
- Merged output has correct typing.
- Record merging support.
- Array merging support.
- Map and Set merging support.
- Customized merging.

## Usage

### Example using default config

```js
import { deepmerge } from "deepmerge-ts";

const x = {
  record: {
    prop1: "value1",
    prop2: "value2",
  },
  array: [1, 2, 3],
  set: new Set([1, 2, 3]),
  map: new Map([
    ["key1", "value1"],
    ["key2", "value2"],
  ]),
};

const y = {
  record: {
    prop1: "changed",
    prop3: "value3",
  },
  array: [2, 3, 4],
  set: new Set([2, 3, 4]),
  map: new Map([
    ["key2", "changed"],
    ["key3", "value3"],
  ]),
};

const merged = deepmerge(x, y);

console.log(merged);

// Prettierfied output:
//
// Object {
//   "record": Object {
//     "prop1": "changed",
//     "prop2": "value2",
//     "prop3": "value3",
//   },
//   "array": Array [1, 2, 3, 2, 3, 4],
//   "set": Set { 1, 2, 3, 4 },
//   "map": Map {
//     "key1" => "value1",
//     "key2" => "changed",
//     "key3" => "value3",
//   },
// }
```

You can try out this example at [codesandbox.io](https://codesandbox.io/s/deepmerge-ts-example-iltxby?file=/src/example.ts).

### Using customized config

[See deepmerge custom docs](./docs/deepmergeCustom.md).

## Performance

We use smart merging instead of the classic merging strategy which some alternative libraries use. This vastly improves performance, both in execution time and memory usage.

### Classic Merge (not what we do)

With classic merging, each input is merged with the next input until all inputs are merged.

This strategy has large performance issues when lots of items need to be merged.

![classic merge animation](./assets/classic-merge.gif)

### Smart Merge (what we do)

With our smart merging, we look ahead to see what can be merged and only merge those things.

In addition to performance improvements, this strategy merges multiple inputs at once; allowing for benefits such as taking averages of the inputs.

![smart merge animation](./assets/smart-merge.gif)

## API

[See API docs](./docs/API.md).
