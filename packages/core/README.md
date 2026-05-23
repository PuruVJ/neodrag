# @neodrag/core

Core drag-and-drop engine for [Neodrag](https://neodrag.dev).

## Install

```bash
npm install @neodrag/core@next
```

## Usage

```typescript
import { Neodrag } from '@neodrag/core';
import { axis, grid } from '@neodrag/core/plugins';

const engine = Neodrag.shared;
const handle = engine.draggable(document.querySelector('#box')!, [
  axis('x'),
  grid([10, 10]),
]);

handle.destroy();
```

See [neodrag.dev/docs/core](https://neodrag.dev/docs/core) for plugins, drop targets, and sortable lists.
