# Sortable RFC

## Overview

Sortable functionality in Neodrag provides drag-to-reorder behavior for lists and grids. Unlike generic drag-and-drop which moves items between containers, sortable is specifically designed for reordering elements within a single container with real-time visual feedback.

## Design Principles

1. **Composable with draggable()**: Sortable must work alongside the existing `draggable()` API, not replace it
2. **Container-centric**: Sortable manages the container and coordinates its children
3. **Real-time feedback**: Elements reorder immediately as items are dragged over them
4. **Framework idiomatic**: Consistent API patterns across Svelte, React, Vue, etc.
5. **Opinionated defaults**: Sensible animations, thresholds, and behaviors out of the box

## Architecture

### Core API

```typescript
// Core sortable class
class Sortable {
  constructor(options?: SortableOptions);
  
  // Returns a draggable plugin for items
  item(): DraggablePlugin;
  
  // Manages a container element
  container(element: HTMLElement): () => void;
  
  // Programmatic API
  reorder(from: number, to: number): void;
  reset(): void;
  destroy(): void;
}

interface SortableOptions {
  // Callbacks
  onSort?: (event: SortEvent) => void;
  onStart?: (event: SortStartEvent) => void;
  onEnd?: (event: SortEndEvent) => void;
  
  // Behavior
  animation?: number; // Duration in ms
  handle?: string; // Selector for drag handle
  filter?: string; // Selector for items to exclude
  preventOnFilter?: boolean;
  
  // Visual
  ghostClass?: string;
  chosenClass?: string;
  dragClass?: string;
  
  // Advanced
  swap?: boolean; // Swap mode instead of insert
  multiDrag?: boolean; // Select and drag multiple
  group?: string | SortableGroup; // For cross-container sorting
}
```

### Framework Integration

#### Svelte

```svelte
<script>
  import { draggable } from '@neodrag/svelte';
  import { Sortable } from '@neodrag/svelte/sortable';
  
  // Create sortable instance
  const list = new Sortable({
    onSort: ({ oldIndex, newIndex }) => {
      // Handle reorder
    }
  });
</script>

<!-- Container -->
<div {@attach list.container()}>
  <!-- Items -->
  {#each items as item}
    <div {@attach draggable([list.item()])}>
      {item}
    </div>
  {/each}
</div>
```


#### React

```jsx
import { useDraggable } from '@neodrag/react';
import { useSortable } from '@neodrag/react/sortable';

function SortableList({ items }) {
  const sortable = useSortable({
    onSort: ({ oldIndex, newIndex }) => {
      // Handle reorder
    }
  });
  
  return (
    <div ref={sortable.container}>
      {items.map(item => (
        <SortableItem key={item.id} sortable={sortable}>
          {item.text}
        </SortableItem>
      ))}
    </div>
  );
}

function SortableItem({ children, sortable }) {
  const dragRef = useDraggable([sortable.item()]);
  
  return (
    <div ref={dragRef}>
      {children}
    </div>
  );
}
```

#### Vue

```vue
<template>
  <div ref="sortable.container">
    <div 
      v-for="item in items" 
      :key="item.id"
      v-draggable="[sortable.item()]"
    >
      {{ item }}
    </div>
  </div>
</template>

<script setup>
import { draggable } from '@neodrag/vue';
import { useSortable } from '@neodrag/vue/sortable';

const sortable = useSortable({
  onSort: ({ oldIndex, newIndex }) => {
    // Handle reorder
  }
});
</script>
```

#### Vanilla

```javascript
import { draggable } from '@neodrag/vanilla';
import { Sortable } from '@neodrag/vanilla/sortable';

const sortable = new Sortable({
  onSort: ({ oldIndex, newIndex }) => {
    // Handle reorder
  }
});

// Setup container
const container = document.querySelector('.list');
sortable.container(container);

// Setup items
container.querySelectorAll('.item').forEach(item => {
  draggable(item, [sortable.item()]);
});
```

## Implementation Details

### How it Works

1. **Container Registration**: When `sortable.container()` is attached, it:
   - Sets up mutation observers to track children
   - Initializes internal state for tracking positions
   - Prepares animation and transition management

2. **Item Plugin**: The `sortable.item()` plugin:
   - Registers the element with its parent sortable container
   - Intercepts drag events to coordinate with the container
   - Manages visual states (dragging, chosen, ghost)

3. **Reordering Logic**:
   - On drag start: Mark item as dragging, record original position
   - On drag over: Calculate insertion point, animate surrounding items
   - On drag end: Commit or cancel the reorder operation

### State Management

```typescript
interface SortableState {
  draggedElement: HTMLElement | null;
  draggedIndex: number;
  targetIndex: number;
  originalOrder: HTMLElement[];
  placeholder: HTMLElement | null;
  isMultiDrag: boolean;
  selectedElements: Set<HTMLElement>;
}
```

### Cross-Container Sorting

For advanced use cases, sortables can be grouped:

```javascript
const sortableA = new Sortable({
  group: 'shared',
  onSort: handleSort,
  onAdd: handleAdd,
  onRemove: handleRemove
});

const sortableB = new Sortable({
  group: 'shared',
  onSort: handleSort,
  onAdd: handleAdd,
  onRemove: handleRemove
});
```

## Comparison with Current Plugin Approach

### Current (Plugin)
```javascript
droppable([
  sortable({ onSort })
])
```

**Limitations:**
- Sortable doesn't have full control over drag behavior
- Complex coordination between drag and drop systems
- Hard to implement sortable-specific features (multi-drag, animations)

### Proposed (Dedicated Factory)
```javascript
const sort = sortable({ onSort });
// Container gets sortable management
{@attach sort.container()}
// Items get draggable with sortable plugin
{@attach draggable([sort.item()])}
```

**Benefits:**
- Clear ownership and separation of concerns
- Sortable controls its domain completely
- Still composes with draggable() for individual items
- Can provide rich, sortable-specific features

## Features Roadmap

### Phase 1: Core Functionality
- [x] Basic reordering within container
- [x] Real-time visual feedback
- [x] Framework integrations
- [ ] Animation system
- [ ] Drag handle support

### Phase 2: Enhanced Features
- [ ] Multi-drag selection
- [ ] Swap mode
- [ ] Auto-scroll
- [ ] Nested sortables
- [ ] Grid sorting

### Phase 3: Advanced
- [ ] Cross-container sorting (groups)
- [ ] Conditional sorting (validation)
- [ ] Virtual list support
- [ ] Touch gesture support
- [ ] Accessibility (keyboard sorting)

## Migration Path

For users currently using the drop plugin approach:

```javascript
// Before
import { droppable, sortable } from '@neodrag/svelte/drop';

<div {@attach droppable([sortable({ onSort })])}>
  <div {@attach draggable()}>Item</div>
</div>

// After
import { sortable } from '@neodrag/svelte/sortable';

const sort = sortable({ onSort });

<div {@attach sort.container()}>
  <div {@attach draggable([sort.item()])}>Item</div>
</div>
```

## Benefits

1. **Better Separation**: Sortable owns its behavior domain completely
2. **Richer Features**: Can implement sortable-specific features without plugin constraints
3. **Cleaner API**: More intuitive than nested plugin approach
4. **Performance**: Optimized specifically for reordering use case
5. **Maintainability**: Easier to debug and extend

## Open Questions

1. Should we support a "simple mode" that auto-applies draggable to children?
2. How should nested sortables work (e.g., Trello board with sortable lists containing sortable cards)?
3. Should animation be built-in or plugin-based?
4. How to handle accessibility - keyboard support for reordering?
5. Should we provide built-in persistence (localStorage, etc.)?

## Conclusion

Moving sortable from a drop plugin to its own factory that produces draggable plugins creates a cleaner architecture that respects the library's core identity (everything builds on `draggable()`) while giving sortable the control it needs to provide a rich, opinionated reordering experience.