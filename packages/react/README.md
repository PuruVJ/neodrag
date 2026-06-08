<p align="center">
<a href="https://next.neodrag.dev"><img src="https://next.neodrag.dev/logo.svg" height="150" /></a>
</p>

<h1 align="center">
@neodrag/react
</h1>

<h2 align="center">
One draggable to rule em all
</h2>

<p align="center">A lightweight React integration for Neodrag with class bindings and hooks.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@neodrag/react"><img src="https://img.shields.io/npm/v/@neodrag/react?color=e63900&label="></a>
<p>

<p align="center"><a href="https://next.neodrag.dev/docs/react">Getting Started</a></p>

# Features

- 🤏 **Small in size** - plugin architecture enables tree-shaking
- 🧩 **Plugin-based** - mix and match only what you need
- ⚡ **Performance** - event delegation, pointer capture, optimized for modern browsers
- 🎯 **React bindings** - `Draggable` class, `useDraggable`, `{...spread}` target props
- 🔄 **Reactive** - pass `() => plugins`; the binding reconciles automatically

# Installing

```bash
npm install @neodrag/react@next
```

# Usage

## Class binding (recommended)

```tsx
import { useMemo } from 'react';
import { Draggable, useDraggableBinding } from '@neodrag/react';
import { axis, grid } from '@neodrag/react/plugins';

function App() {
  const drag = useMemo(
    () =>
      new Draggable({
        plugins: [axis('x'), grid([10, 10])],
        onDrag(data) {
          console.log(data.offset, data.input.kind);
        },
      }),
    [],
  );

  const { spread, isDragging } = useDraggableBinding(drag);

  return (
    <>
      <div {...spread} style={{ width: 100, height: 100 }} />
      {isDragging ? 'Dragging…' : 'Idle'}
    </>
  );
}
```

## Hook with options

```tsx
import { useDraggable } from '@neodrag/react';
import { position } from '@neodrag/react/plugins';

function App() {
  const { spread, isDragging } = useDraggable({
    plugins: [position(() => ({ x: 0, y: 0 }))],
    onDrag(data) {
      console.log(data.offsetPx);
    },
  });

  return (
    <>
      <div {...spread} />
      {isDragging ? 'Dragging…' : null}
    </>
  );
}
```

## Legacy ref + plugins

```tsx
import { useDraggable } from '@neodrag/react';
import { axis } from '@neodrag/react/plugins';

function App() {
  const { ref } = useDraggable([axis('x')]);
  return <div ref={ref}>Hello</div>;
}
```

## Sortable

```tsx
import { Sortable, useSortableItem } from '@neodrag/react/sortable';
import { useSortable } from '@neodrag/react/sortable';
import { position } from '@neodrag/react/plugins';

const list = new Sortable({
  items: () => rows,
  keyBy: (r) => r.id,
  itemPlugins: (key) => [position(() => positions[key])],
  onReorder: (next) => setRows(next),
});

function Row({ id }: { id: string }) {
  const { spread } = useSortableItem(list, id);
  return <button {...spread}>{id}</button>;
}
```

<a href="https://next.neodrag.dev/docs/react" style="font-size: 2rem">Read the docs</a>

# License

MIT License © Puru Vijay
