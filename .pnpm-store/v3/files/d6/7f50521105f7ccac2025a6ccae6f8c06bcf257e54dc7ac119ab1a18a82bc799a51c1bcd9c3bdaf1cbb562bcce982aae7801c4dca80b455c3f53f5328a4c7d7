# cjs-loader

Node.js `require()` hook to instantaneously transform ESM & TypeScript to CommonJS on demand using [esbuild](https://esbuild.github.io/).

### Features
- Transforms ESM & TypeScript to CommonJS on demand
- Supports TS extensions `.cjs` & `.mjs` (`.cts` & `.mts`)
- Cached for performance boost
- Supports Node.js v12.16.2+
- Handles `node:` import prefixes
- Resolves `tsconfig.json` [`paths`](https://www.typescriptlang.org/tsconfig#paths)

> **Tip:**
>
> _cjs-loader_ doesn't hook into dynamic `import()` calls.
>
> Use this with [esm-loader](https://github.com/esbuild-kit/esm-loader) for `import()` support. Alternatively, use [tsx](https://github.com/esbuild-kit/tsx) to handle them both automatically.

## Install

```sh
npm install --save-dev @esbuild-kit/cjs-loader
```

## Usage

Pass `@esbuild-kit/cjs-loader` into the [`--require`](https://nodejs.org/api/cli.html#-r---require-module) flag
```sh
node -r @esbuild-kit/cjs-loader ./file.js
```

### TypeScript configuration
The following properties are used from `tsconfig.json` in the working directory:
- `jsxFactory`
- `jsxFragmentFactory`

#### Custom `tsconfig.json` path
By default, `tsconfig.json` will be detected from the current working directory.

To set a custom path, use the `ESBK_TSCONFIG_PATH` environment variable:

```sh
ESBK_TSCONFIG_PATH=./path/to/tsconfig.custom.json node -r @esbuild-kit/cjs-loader ./file.js
```

### Cache
Modules transformations are cached in the system cache directory ([`TMPDIR`](https://en.wikipedia.org/wiki/TMPDIR)). Transforms are cached by content hash so duplicate dependencies are not re-transformed.

Set environment variable `ESBK_DISABLE_CACHE` to a truthy value to disable the cache:

```sh
ESBK_DISABLE_CACHE=1 node -r @esbuild-kit/cjs-loader ./file.js
```

## Related

- [tsx](https://github.com/esbuild-kit/tsx) - Node.js runtime powered by esbuild using [`@esbuild-kit/cjs-loader`](https://github.com/esbuild-kit/cjs-loader) and [`@esbuild-kit/esm-loader`](https://github.com/esbuild-kit/esm-loader).

- [@esbuild-kit/esm-loader](https://github.com/esbuild-kit/esm-loader) - TypeScript to ESM transpiler using the Node.js loader API.
