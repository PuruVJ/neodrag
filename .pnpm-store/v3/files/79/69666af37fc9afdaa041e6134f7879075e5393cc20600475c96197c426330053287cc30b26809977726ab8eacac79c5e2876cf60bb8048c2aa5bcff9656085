![Node.js CI](https://github.com/pchynoweth/svelte-sequential-preprocessor/workflows/Node.js%20CI/badge.svg)
![new-version](https://github.com/pchynoweth/svelte-sequential-preprocessor/workflows/new-version/badge.svg)
[![Build Status](https://travis-ci.org/pchynoweth/svelte-sequential-preprocessor.svg?branch=master)](https://travis-ci.org/pchynoweth/svelte-sequential-preprocessor)
[![version](https://img.shields.io/npm/v/svelte-sequential-preprocessor.svg?style=flat-square)](http://npm.im/svelte-sequential-preprocessor)

# svelte-sequential-preprocessor

> A [Svelte](https://svelte.dev) preprocessor that wraps preprocessors to force them to be called sequentially.

## Overview

Svelte evaluates preprocessors by running all markup preprocessors first, then script and finally styles.  Some preprocesses may not work if other preprocessors haven't been run.  For example, [svelte-image](https://github.com/matyunya/svelte-image) uses `svelte.parse()` internally, so [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess) needs to be run before if any scss is present.

## Installation

Using npm:
```bash
$ npm i -D svelte-sequential-preprocessor
```

## Usage

### With `rollup-plugin-svelte`

```js
// rollup.config.js
import svelte from 'rollup-plugin-svelte';
import seqPreprocessor from 'svelte-sequential-preprocessor'
import autoPreprocess from 'svelte-preprocess'
import image from 'svelte-image'

export default {
  ...,
  plugins: [
    svelte({
      preprocess: seqPreprocessor([ autoPreprocess(), image() ])
    })
  ]
}
```

### With `svelte-loader`

```js
  ...
  module: {
    rules: [
      ...
      {
        test: /\.(html|svelte)$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            preprocess: require('svelte-sequential-preprocessor')([ require('svelte-preprocess'), require('svelte-image')])
          },
        },
      },
      ...
    ]
  }
  ...
```

### With Sapper

```js
import seqPreprocessor from 'svelte-sequential-preprocessor';
import autoPreprocess from 'svelte-preprocess'
import image from 'svelte-image'

const preprocess = seqPreprocessor([ autoPreprocess(), image() ]);

export default {
  client: {
    plugins: [
      svelte({
        preprocess,
        // ...
      }),
  },
  server: {
    plugins: [
      svelte({
        preprocess,
        // ...
      }),
    ],
  },
};
```