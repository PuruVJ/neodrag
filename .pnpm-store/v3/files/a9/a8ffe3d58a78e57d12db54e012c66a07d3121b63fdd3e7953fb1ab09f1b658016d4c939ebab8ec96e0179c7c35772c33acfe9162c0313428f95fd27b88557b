<div align="center">
  <img src="logo.png" alt="tsm" width="200" />
</div>

<div align="center">
  <a href="https://npmjs.org/package/tsm">
    <img src="https://badgen.net/npm/v/tsm" alt="version" />
  </a>
  <a href="https://github.com/lukeed/tsm/actions">
    <img src="https://github.com/lukeed/tsm/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://npmjs.org/package/tsm">
    <img src="https://badgen.net/npm/dm/tsm" alt="downloads" />
  </a>
  <a href="https://packagephobia.now.sh/result?p=tsm">
    <img src="https://badgen.net/packagephobia/publish/tsm" alt="publish size" />
  </a>
</div>

<div align="center">TypeScript Module Loader</div>

## Features

* Supports `node <file>` usage
* Supports [ESM `--loader`](https://nodejs.org/api/esm.html#esm_loaders) usage<sup>†</sup>
* Supports [`--require` hook](https://nodejs.org/api/cli.html#cli_r_require_module) usage
* Optional [configuration](/docs/configuration.md) file for per-extension customization

> <sup>†</sup> The ESM Loader API is still **experimental** and will change in the future.

## Install

```sh
# install as project dependency
$ npm install --save-dev tsm

# or install globally
$ npm install --global tsm
```

## Usage

> **Note:** Refer to [`/docs/usage.md`](/docs/usage.md) for more information.

```sh
# use as `node` replacement
$ tsm server.ts

# forwards any `node` ENV or flags
$ NO_COLOR=1 tsm server.ts --trace-warnings

# use as `--require` hook
$ node --require tsm server.tsx
$ node -r tsm server.tsx

# use as `--loader` hook
$ node --loader tsm main.jsx
```

## License

MIT © [Luke Edwards](https://lukeed.com)
