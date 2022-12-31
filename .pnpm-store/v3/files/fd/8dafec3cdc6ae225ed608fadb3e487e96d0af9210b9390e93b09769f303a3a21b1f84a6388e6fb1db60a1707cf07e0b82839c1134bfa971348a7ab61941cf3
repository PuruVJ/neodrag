<p>
  <img width="100%" src="https://assets.solidjs.com/banner?project=Refresh&type=core" alt="Solid Refresh">
</p>

# Solid Refresh

```bash
npm i -D solid-refresh
```

```bash
yarn add -D solid-refresh
```

```bash
pnpm add -D solid-refresh
```

This project aims to provide HMR for Solid for various bundlers. It comes with a babel plugin and a runtime. Over time I hope to add different bundlers. Today it supports:

* Webpack (for strict ESM, use option `bundler: "webpack5"`)
* Parcel
* Nollup
* Vite (with option `bundler: "vite"`)
* Snowpack (with option `bundler: "esm"`)

## Setup

### Vite

`solid-refresh` is already built into [`vite-plugin-solid`](https://github.com/solidjs/vite-plugin-solid).

### Parcel

You can add the following to `.babelrc`:

```json
{
  "env": {
    "development": {
      "plugins": [
        ["module:solid-refresh/babel"]
      ]
    }
  }
}
```

### Webpack

Requires the use of [`babel-loader`](https://www.npmjs.com/package/babel-loader). Add the following to `.babelrc`:

```json
{
  "env": {
    "development": {
      "plugins": ["solid-refresh/babel"]
    }
  }
}
```

If you're using strict ESM:

```json
{
  "env": {
    "development": {
      "plugins": ["solid-refresh/babel", { "bundler": "webpack5" }]
    }
  }
}
```

### Nollup

Requires the use of [`@rollup/plugin-babel`](https://www.npmjs.com/package/@rollup/plugin-babel). Add the following to `.babelrc`:

```json
{
  "env": {
    "development": {
      "plugins": ["solid-refresh/babel"]
    }
  }
}
```

### Snowpack

Requires the use of [`@snowpack/plugin-babel`](https://www.npmjs.com/package/@snowpack/plugin-babel).  Add the following to `.babelrc`:

```json
{
  "env": {
    "development": {
      "plugins": ["solid-refresh/babel", { "bundler": "esm" }]
    }
  }
}
```

### Other dev servers

* [`wmr`](https://wmr.dev/) - SolidJS is yet to be supported or isn't clear yet. It will use the same config as Snowpack.
* [`rollup-plugin-hot`](https://github.com/rixo/rollup-plugin-hot) - The library uses almost an ESM HMR-like API however it behaves the same way as Parcel. Supporting this library is still unclear.

## How it works

The babel plugin will transform components with matching Pascal-cased names (indicating that they are components). This detection is supported in variable declarations, function declarations and named exports:

```jsx
// This works
function Foo() {
  return <h1>Hello Foo</h1>;
}

// This also works
const Bar = () => <h1>Hello Bar</h1>;
```

Anonymous functions with `props` as the only parameter are also supported.

```js
// This also works
export default function (props) {
  return <h1>Hello Anonymous!</h1>;
}
```

The components are wrapped and memoized. When the module receives an update, it replaces the old components from the old module with the new components.

## Automatic Render Cleanup

The plugin automatically handles cleanups for unhandled `render` and `hydrate` calls from `solid-js/web`.

You can disable this feature entirely through the option `"fixRender": false`.

## Pragma

On a per file basis, use comments at top of file to opt out(change moves up to parent):

```js
/* @refresh skip */
```

Or force reload:

```js
/* @refresh reload */
```

### `@refresh granular`

By default, components from the old module are replaced with the new ones from the replacement module, which might cause components that hasn't really changed to unmount abruptly.

Adding `@refresh granular` comment pragma in the file allows components to opt-in to granular replacement: If the component has changed *code-wise*, it will be replaced, otherwise, it will be retained, which allows unchanged ancestor components to preserve lifecycles.

## Limitations

- Preserving state: The default mode does not allow preserving state through module replacement. `@refresh granular` allows this partially.
- No HOC support.
