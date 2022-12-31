# `@proload/core`

Proload searches for and loads your tool's JavaScript configuration files. Users have complex expectations when it comes to configuration files—the goal of Proload is to offer a single, straightforward and extensible API for loading them.

```js
import load from '@proload/core';

await load('namespace');
```

> `@proload/core` can be used in `node@12.20.1` and up. It relies on Node's native ESM semantics.

## Motivation

Configuration files are really difficult to get right. Tool authors tend to think, "Easy solve! I'll just have everyone use one `namespace.config.js`!" In most cases that should work, but since `node@12.17.0`, plain `.js` files can be written in either ESM or CJS—both formats are officially supported and can be configured on a per-project basis. Additionally, `node` is able to load any file using a `.cjs` or `.mjs` extension, not just `.js`.

Many popular libraries get these semantics wrong, but maintaining and testing this resolution logic in library code can be a huge maintanence burden. As a library author, you don't need to know (or care) which module format your users choose—you just need to load the contents of the config file. `@proload/core` is a well-tested solution that gets these semantics right, so you can focus on more important things.

> You probably have TypeScript users, too! They would definitely appreciate being able to write a `.ts` config file. `@proload/core` uses a plugin system to load non-JavaScript files. See [Plugins](https://github.com/natemoo-re/proload/tree/main/packages/core#plugins) or [`@proload/plugin-typescript`](https://github.com/natemoo-re/proload/tree/main/packages/core#typescript) specifically.

## Resolution

Out of the box, `@proload/core` searches up the directory tree for the following files:

- a `[namespace].config.js`, `[namespace].config.cjs`, or `[namespace].config.mjs` file
- any of the `js/cjs/mjs` files inside of `config/` directory
- a `package.json` file with a top-level `[namespace]` key


Here's an overview of all the files supported by default for a tool named `donut`.

```
await load('donut');

.
├── donut.config.js        // Either ESM or CJS supported
├── donut.config.cjs
├── donut.config.mjs
├── config/                // Great for organizing many configs
│   ├── donut.config.js
│   ├── donut.config.cjs
│   └── donut.config.mjs
└── package.json           // with top-level "donut" property
```

## `resolve`

`resolve` is an additional named export of `@proload/core`. It is an `async` function that resolves **but does not load** a configuration file.

- `namespace` is the name of your tool. As an example, `donut` would search for `donut.config.[ext]`.
- `opts` configure the behavior of `load`. See [Options](https://github.com/natemoo-re/proload/tree/main/packages/core#options).

```ts
resolve(namespace: string, opts?: ResolveOptions);
```

## `load`

The `default` export of `@proload/core` is an `async` function to load a configuration file.

- `namespace` is the name of your tool. As an example, `donut` would search for `donut.config.[ext]`.
- `opts` configure the behavior of `load`. See [Options](https://github.com/natemoo-re/proload/tree/main/packages/core#options).

```ts
load(namespace: string, opts?: LoadOptions);
```


## Options

### cwd
`load` searches up the directory tree, beginning from this loaction. Defaults to `process.cwd()`.

```js
import load from '@proload/core';
await load('namespace', { cwd: '/path/to/user/project' });
```

### filePath
If you already have the exact (absolute or relative) `filePath` of your user's config file, set the `filePath` option to disable Proload's search algorithm.

```js
import load from '@proload/core';
await load('namespace', { cwd: '/path/to/user/project', filePath: './custom-user-config.js' });
```

### mustExist
`mustExist` controls whether a configuration _must_ be found. Defaults to `true`—Proload will throw an error when a configuration is not found. To customize error handling, you may check the shape of the thrown error. 

Setting this option to `false` allows a return value of `undefined` when a configuration is not found.

```js
import load, { ProloadError } from '@proload/core';

try {
    await load('namespace', { mustExist: true });
} catch (err) {
    // Proload couldn't resolve a configuration, log a custom contextual error
    if (err instanceof ProloadError && err.code === 'ERR_PROLOAD_NOT_FOUND') {
        console.error(`See the "namespace" docs for configuration info`);
    }
    throw err;
}
```

### context

Users may want to dynamically generate a different configuration based on some contextual information passed from your tool. Any `{ context }` passed to the `load` function will be forwarded to configuration "factory" functions.

```js
// Library code
import load from '@proload/core';
await load('namespace', { context: { isDev: true }});

// namespace.config.js
export default ({ isDev }) => {
    return { featureFlag: isDev }
}
```

### accept
If you need complete control over which file to load, the `accept` handler can customize resolution behavior. A return value of `true` marks a file to be loaded, any other return values (even truthy ones) is ignored.

See the [`accept`](https://github.com/natemoo-re/proload/blob/34413acf87d98d3ef310ce2873103455cb2eb379/packages/core/lib/index.d.ts#L11) interface.

> Note that [Plugins](https://github.com/natemoo-re/proload/tree/main/packages/core#plugins) are able to modify similar behavior. To load non-JavaScript files, you should use a plugin instead of `accept`.

```js
import load from '@proload/core';

await load('donut', {
    accept(fileName) {
        // Support alternative spelling for any European friends
        return fileName.startsWith('doughnut.config');
    }
})
```

The following example uses `@proload/plugin-typescript` to add support for loading `.ts` files and an `accept` handler to require all config files to use the `.ts` extension.
```js
import load from '@proload/core';
import typescript from '@proload/plugin-typescript';

load.use([typescript]);
await load('namespace', {
    accept(fileName) {
        // Only accept `.ts` config files
        return fileName.endsWith('.ts');
    }
})
```

### merge

To customize `extends` behavior, you may pass a custom `merge` function to the `load` function. By default, [`deepmerge`](https://github.com/TehShrike/deepmerge) is used.

```js
// Library code
import load from '@proload/core';

const shallowMerge = (a, b) => ({ ...a, ...b })
await load('namespace', { merge: shallowMerge });

// namespace.config.js
export default {
    extends: ['./a.js', './b.js']
}

// a.js
export default {
    a: true
}

// b.js
export default {
    b: true
}

// result
{
    a: true,
    b: true
}
```


## Automatic `extends`

Tools like `typescript` and `babel` have popularized the ability to share configuration presets through a top-level `extends` clause. `extends` also allows you to share a local base configuration with other packages, which is extremely useful for monorepo users.

Custom implementation of this behavior can be difficult, so `@proload/core` automatically recognizes top-level `extends` clauses (`string[]`) for you. It recursively resolves and merges all dependent configurations.

```js
// namespace.config.js
export default {
    extends: ['@namespace/preset', '../namespace.base.config.js']
}
```

### Extending local configuration files
In many cases, particularly in monorepos, it's useful to have a base configuration file and use `extends` in any sub-packages to inherit the base configuration. `@proload/core` resolves paths in `extends` relative to the configuration file itself.

```
.
├── namespace.base.config.js
└── packages/
    ├── package-a/
    │   └── namespace.config.js
    └── package-b/
        └── namespace.config.js
```

### Extending configuration presets
`@proload/core` uses the same strategy to resolve a configuration file from project `dependencies` as it does for user configurations. When publishing a configuration preset, use the same file naming strategy as you would for local configuration.

```
.
├── node_modules/
│   └── @namespace/
│       └── preset-env/
│           ├── package.json
│           └── namespace.config.js
├── package.json
└── namespace.config.js
```

Assuming `@namespace/preset-env` is a project dependency, the top-level `namespace.config.js` file can use `extends` to reference the dependency.

```js
export default {
    extends: ['@namespace/preset-env']
}
```

## Plugins

In order to support as many use cases as possible, `@proload/core` uses a plugin system. Plugins build on each other and are designed to be combined. For example, to support a `namespacerc.json` file, you could use both `@proload/plugin-json` and `@proload/plugin-rc`.

```js
import load from '@proload/core';
import rc from '@proload/plugin-rc';
import json from '@proload/plugin-json';

load.use([rc, json]);
await load('namespace');
```

### TypeScript
In order to load a `[namespace].config.ts` file, use `@proload/plugin-typescript`.

```js
import load from '@proload/core';
import typescript from '@proload/plugin-typescript';

load.use([typescript]);
await load('namespace');
```

### JSON
In order to load a `[namespace].config.json` file, use `@proload/plugin-json`.

```js
import load from '@proload/core';
import json from '@proload/plugin-json';

load.use([json]);
await load('namespace');
```

### YAML
In order to load a `[namespace].config.yaml` or `[namespace].config.yml` file, use `@proload/plugin-yaml`.

```js
import load from '@proload/core';
import yaml from '@proload/plugin-yaml';

load.use([yaml]);
await load('namespace');
```

### RC files
In order to load a `[namespace]rc` file with any extension, use `@proload/plugin-rc`.

```js
import load from '@proload/core';
import rc from '@proload/plugin-rc';

load.use([rc]);
await load('namespace');
```

### All Plugins
For illustrative purposes (please don't do this), combining all of these plugins would support the following resolution logic:

```
.
├── namespace.config.js
├── namespace.config.cjs
├── namespace.config.mjs
├── namespace.config.ts
├── namespace.config.json
├── namespace.config.yaml
├── namespace.config.yml
├── namespacerc.js
├── namespacerc.cjs
├── namespacerc.mjs
├── namespacerc.ts
├── namespacerc.json
├── namespacerc.yaml
├── namespacerc.yml
├── config/
│   ├── namespace.config.js
│   ├── namespace.config.cjs
│   ├── namespace.config.mjs
│   ├── namespace.config.ts
│   ├── namespace.config.json
│   ├── namespace.config.yaml
│   ├── namespace.config.yml
│   ├── namespacerc.js
│   ├── namespacerc.cjs
│   ├── namespacerc.mjs
│   ├── namespacerc.ts
│   ├── namespacerc.json
│   ├── namespacerc.yaml
│   └── namespacerc.yml
└── package.json
```

## Credits

Proload is heavily inspired by tools like [`cosmiconfig`](https://github.com/davidtheclark/cosmiconfig#readme) and [`rc`](https://github.com/dominictarr/rc). 

Proload would not be possible without [@lukeed](https://github.com/lukeed)'s amazing work on [`escalade`](https://github.com/lukeed/escalade) and [`uvu`](https://github.com/lukeed/uvu).
