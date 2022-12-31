[![npm version](https://img.shields.io/npm/v/svelte-local-storage-store.svg)](https://www.npmjs.com/package/svelte-local-storage-store) [![license](https://img.shields.io/npm/l/svelte-local-storage-store.svg)](LICENSE.md) [![codecov](https://codecov.io/gh/joshnuss/svelte-local-storage-store/branch/master/graph/badge.svg?token=GU607D2YRQ)](https://codecov.io/gh/joshnuss/svelte-local-storage-store)

# svelte-local-storage-store

A store that adds pub/sub to local storage. Supports changes across multiple tabs.

## Installation

```bash
npm install svelte-local-storage-store
```

## Usage

Define the store:

```javascript
import { writable } from 'svelte-local-storage-store'

// First param `preferences` is the local storage key.
// Second param is the initial value.
export const preferences = writable('preferences', {
  theme: 'dark',
  pane: '50%',
  ...
})
```

Then when you want to use the store:
  
```javascript
import { get } from 'svelte/store'
import { preferences } from './stores'

preferences.subscribe(...) // subscribe to changes
preferences.update(...) // update value
preferences.set(...) // set value
get(preferences) // read value
$preferences // read value with automatic subscription
```

Change serializer or storage type: 

```javascript
import { writable } from 'svelte-local-storage-store'
import * as devalue from 'devalue';

// Third parameter is options.
export const preferences = writable('preferences', 'foo', {
  serializer: devalue // defaults to JSON
  storage: 'session' // set to 'session' for sessionStorage, defaults to 'local'
})
```

## License

MIT
