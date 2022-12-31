# tsconfig-resolver

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![GitHub Actions Build Status](https://github.com/ifiokjr/tsconfig-resolver/workflows/Node%20CI/badge.svg)](https://github.com/ifiokjr/tsconfig-resolver/actions?query=workflow%3A%22Node+CI%22)
[![Version][version]][npm]
[![Weekly Downloads][downloads-badge]][npm]
[![Typed Codebase][typescript]](./src/index.ts)
![MIT License][license]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

<br />

> A tool for loading the nearest tsconfig file in the same way the TypeScript compiler does. It walks up the directory tree until it finds the first matching `tsconfig.json` file.

<br />

## Table of Contents

- [tsconfig-resolver](#tsconfig-resolver)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
    - [Setup](#setup)
    - [Code Example](#code-example)
  - [API](#api)
    - [`tsconfigResolverSync`](#tsconfigresolversync)
      - [Returns](#returns)
      - [Options](#options)
    - [`tsconfigResolver`](#tsconfigresolver)
    - [`clearCache`](#clearcache)
    - [`CacheStrategy`](#cachestrategy)
    - [`TsConfigErrorReason`](#tsconfigerrorreason)
    - [`TsConfigJson`](#tsconfigjson)
  - [Contributing](#contributing)
  - [Versioning](#versioning)
  - [License](#license)
  - [Contributors](#contributors)

<br />

## Usage

`tsconfig-resolver` is designed to be used inside your node project. It automatically populates the extends field so that the configuration received is the same as would be used by any consuming TypeScript project.

<br />

### Setup

First, install the plugin and it's peer dependencies:

```bash
npm install --save tsconfig-resolver
```

or

```bash
yarn add tsconfig-resolver
```

<br />

### Code Example

The following will load the first `tsconfig.json` file working upwards from the `process.cwd()` of the running node process.

```ts
import { tsconfigResolver } from 'tsconfig-resolver';

const result = await tsconfigResolver();

// without type narrowing
console.log(result?.config);

// with type narrowing
if (result.exists) {
  console.log(result.config);
}
```

Configuration options can also be passed into the export function.

```ts
import { join } from 'path';
import { CacheStrategy, tsconfigResolver } from 'tsconfig-resolver';
const result = tsconfig({
  cwd: join(__dirname, 'src'),
  fileName: 'tsconfig.prod.json',
  cache: CacheStrategy.Directory,
});
```

<br />

## API

### `tsconfigResolverSync`

```ts
import { tsconfigResolverSync } from 'tsconfig-resolver';
```

#### Returns

The function returns an object consisting of the following.

| Property          | Type                                 | Description                                                                                                                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **config**        | `TsConfigJson` or `undefined`        | The configuration object. <ul><li>`undefined` when the tsconfig resolver failed and no configuration was found.</li><li>`TsConfigJson` (exported by the `type-fest` library) when the resolved tsconfig has been found and loaded.</li></ul>                                                                                                                           |
| **exists**        | `boolean`                            | Whether or not the configuration could be loaded. <ul><li>`false` when no tsconfig could be found.</li><li>`true` when a valid tsconfig file has been found and successfully loaded.</li></ul>                                                                                                                                                                         |
| **reason**        | `TsConfigErrorReason` or `undefined` | The reason for failure. <ul><li>`TsConfigErrorReason.NotFound` when the config failure is because the filename has not been found.</li><li>`TsConfigErrorReason.InvalidConfig` when the config failure is because of an invalid config.</li><li>`undefined` when no failure has occurred.</li></ul>                                                                    |
| **path**          | `string` or `undefined`              | The absolute path to the tsconfig.json or given filename.<ul><li>`undefined` when not found.</li><li>`string` when config json is invalid.</li><li>`string` when a valid tsconfig has been loaded.</li></ul>                                                                                                                                                           |
| **extendedPaths** | `string[]` or `undefined`            | The extendedPaths array.<ul><li>`undefined` when the tsconfig resolver failed to load a valid configuration.</li><li>`string[]` of absolute paths to resolved tsconfig files when extended paths are encountered.</li><li>`[]` an empty array when no extended paths are encountered.</li><li>`[]` an empty array when ignoreExtends options is set to true.</li></ul> |
| **isCircular**    | `boolean` or `undefined`             | The `isCircular` config flag.<ul><li>`undefined` when the tsconfig resolver failed to load a valid configuration.</li><li>`true` when a circular `extends` property was encountered (an extends path chain that references itself).</li><li>`false` when no circular `extends` property was encountered.</li></ul>                                                     |

#### Options

| Property          | Type                  | Default           | Description                                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **cwd**           | `string`              | `process.cwd()`   | The directory to start searching from.                                                                                                                                                                                                                                                                                                                                   |
| **searchName**    | `string`              | `'tsconfig.json'` | The tsconfig file name to search for. This is where the `TsConfigJson` configuration object will be loaded from.                                                                                                                                                                                                                                                         |
| **filePath**      | `string`              | `undefined`       | A direct path to the tsconfig file you would like to load. The path will be resolved relative to the current `process.cwd()`. If it leads to a directory then the `searchName` will be appended. \* This also supports the `npm:` prefix which will find the given npm package directory, if it is installed. When provided the `cache` is set to `'always'` by default. |
| **cache**         | `string` or `boolean` | `'never'`         | Set the caching strategy that will be used when searching for a file that's already been found. When a `filePath` is provided the default value becomes `'always'`.                                                                                                                                                                                                      |
| **ignoreExtends** | `boolean`             | `false`           | When true will not automatically populate the `extends` argument. This is useful if all you want is the json object and not the fully resolved configuration.                                                                                                                                                                                                            |

### `tsconfigResolver`

```ts
import { tsconfigResolver } from 'tsconfig-resolver';
```

The same API as `tsconfigResolverSync` except the return value is wrapped in a promise.

### `clearCache`

Clears the cache.

```ts
import { clearCache, tsconfigResolver } from 'tsconfig-resolver';

const result = await tsconfigResolver();

// Now clear the cache.
clearCache();
```

### `CacheStrategy`

```ts
import { CacheStrategy } from 'tsconfig-resolver';
```

Provides the available caching strategies that can be used.

Sometimes you'll want to run this module several times during runtime but it can be slow and expensive walk up the file tree for the tsconfig value every time.

To help prevent unnecessary lookups there are custom caching strategies available.

- `CacheStrategy.Never` - Caching never happens and the returned value is always recalculated
- `CacheStrategy.Always` - The first time the `tsconfigResolver` method is run it will save a cached value (by `searchName`) which will be returned every time after that. This value will always be the same. This is turned on by default when a `filePath` is provided.
- `CacheStrategy.Directory` - The cache will be used when the same directory (and `searchName`) is being searched.

### `TsConfigErrorReason`

```ts
import { TsConfigErrorReason } from 'tsconfig-resolver';
```

This provides the reason for the error in resolving the `tsconfig`.

- `TsConfigErrorReason.NotFound` - The `tsconfig` file could not be found.
- `TsConfigErrorReason.InvalidConfig` - The file was found but the configuration was invalid.

### `TsConfigJson`

Re-exported from [`type-fest`](https://github.com/sindresorhus/type-fest).

<br />

## Contributing

Dive into the codebase with Gitpod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/ifiokjr/tsconfig-resolver)

<br />

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the
[tags on this repository](https://github.com/ifiokjr/tsconfig-resolver/tags).

<br />

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://ifiokjr.com"><img src="https://avatars2.githubusercontent.com/u/1160934?v=4" width="100px;" alt=""/><br /><sub><b>Ifiok Jr.</b></sub></a><br /><a href="https://github.com/ifiokjr/tsconfig-resolver/commits?author=ifiokjr" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

[version]: https://flat.badgen.net/npm/v/tsconfig-resolver
[npm]: https://npmjs.com/package/tsconfig-resolver
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=#tsconfig-resolver
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/tsconfig-resolver
[typescript]: https://flat.badgen.net/badge/icon/TypeScript/?icon=typescript&label&labelColor=blue&color=555555
[downloads-badge]: https://badgen.net/npm/dw/tsconfig-resolver/red?icon=npm
