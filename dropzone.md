# RFC 002: Neodrag Drop Zone System

**RFC:** 002  
**Title:** Plugin-based Drop Zone Architecture with Framework Integration  
**Author:** Development Team  
**Status:** Draft  
**Created:** August 29, 2025  
**Last Modified:** August 29, 2025

## Abstract

This RFC proposes a composable drop zone system for Neodrag that extends existing drag functionality through small, focused plugins that work together like Lego blocks. The design emphasizes plugin composability, maintains bundle size optimization for drag-only users, and enables building complex interactions from simple, reusable pieces.

The proposal addresses limitations in existing drag-and-drop solutions by providing composable plugins that can be mixed and matched to create any drag-drop behavior, from simple sortable lists to complex nested Kanban boards.

## Motivation

### Current State

Neodrag provides sophisticated drag functionality with a mature plugin system, but lacks drop zone capabilities. Users requiring drag-and-drop functionality must integrate third-party solutions that don't leverage Neodrag's architecture, resulting in:

- **Inconsistent APIs** between drag and drop operations
- **Bundle bloat** when drag-only applications include unused drop functionality
- **Coordination difficulties** in multi-zone scenarios
- **Framework integration mismatches** compared to existing Neodrag patterns

### Problems with Alternative Approaches

1. **Source/Target Split Confusion**: Many libraries force artificial separation between draggable sources and drop targets, creating awkward APIs for bidirectional scenarios (sortable lists, Kanban boards)

2. **No Global Coordination**: Drop zones operate in isolation, making multi-zone scenarios (highlighting valid targets, cross-zone validation) difficult to implement

3. **Plugin System Regression**: Drop libraries lose sophisticated features available in drag systems (priority, cancelable operations, performance optimizations)

### Proposed Solution

A composable drop zone system that:

- Small, focused plugins that each do one thing well
- Plugins compose together like Lego blocks to create complex behaviors
- Maintains separate bundles (`@neodrag/[framework]/drop`) for bundle size optimization
- Follows established Neodrag patterns for framework integration
- Automatic coordination between draggable elements and drop zones
- Build any drag-drop pattern through plugin composition

## API Overview

### Core Architecture

```typescript
// @neodrag/core/drop - Simple, composable architecture
interface DropPlugin<State = any> {
  name: string;
  priority?: number;

  setup?(ctx: DropContext): State;
  dragEnter?(
    ctx: DropContext,
    state: State,
    dragData: unknown,
  ): boolean | void;
  dragOver?(
    ctx: DropContext,
    state: State,
    dragData: unknown,
  ): boolean | void;
  dragLeave?(ctx: DropContext, state: State): void;
  drop?(
    ctx: DropContext,
    state: State,
    dragData: unknown,
  ): boolean | void;
  cleanup?(ctx: DropContext, state: State): void;
}

interface DropContext {
  dropZone: HTMLElement;
  dragSource: HTMLElement;
  accept(): void;
  reject(): void;
}

class DropFactory {
  droppable(element: HTMLElement, plugins: DropPlugin[]): () => void;
}
```

### Framework Integration

```typescript
// @neodrag/svelte/drop - Clean attachment pattern
export const droppable: Attachment<HTMLElement>;

// @neodrag/react/drop - Hook pattern
export function useDroppable(
  ref: RefObject<HTMLElement>,
  plugins: DropPlugin[],
): DropState;

// @neodrag/vue/drop - Directive pattern
export const vDroppable: Directive;
```

## Composable Plugin Examples

### Basic Drop Zone

```svelte
<script>
  import { Draggable } from '@neodrag/svelte';
  import { Droppable } from '@neodrag/svelte/drop';
  import { dragData } from '@neodrag/svelte/plugins';
  import { accepts } from '@neodrag/svelte/drop';
  import { events, highlight } from '@neodrag/core/drop/plugins';

  const drag_0 = new Draggable({
    plugins: [dragData({ id: 1, type: 'todo', text: 'Task 1' })],
  });

  const drop_0 = new Droppable({
    plugins: [
      accepts(['todo']),
      highlight({ className: 'drop-highlight' }),
      events({ onDrop: (data) => console.log('Dropped:', data) }),
    ],
  });
</script>

<!-- Draggable item -->
<div {@attach drag_0.attachment}>📝 Task 1</div>

<!-- Drop zone composed from simple plugins -->
<div {@attach drop_0.attachment}>Drop todos here</div>
```

### Sortable List - Composed Behavior

```svelte
<script>
  import { Droppable } from '@neodrag/svelte/drop';
  import { sortable, insertionLine } from '@neodrag/svelte/drop';

  let todos = $state([
    { id: 1, text: 'Task 1' },
    { id: 2, text: 'Task 2' },
    { id: 3, text: 'Task 3' },
  ]);

  const drop_0 = new Droppable({
    plugins: [
      sortable({
        items: () => todos,
        onReorder: (newOrder) => (todos = newOrder),
        type: 'todo',
      }),
      insertionLine({ axis: 'y' }),
    ],
  });
</script>

<!-- Sortable list: composition of simple plugins -->
<ul {@attach drop_0.attachment}>
  {#each todos as todo}
    <li>{todo.text}</li>
  {/each}
</ul>
```

### Kanban Board with Global Coordination

```svelte
<script>
  import { Draggable } from '@neodrag/svelte';
  import { Droppable } from '@neodrag/svelte/drop';
  import { validation, highlightOnDrag, cardDrop } from '@neodrag/svelte/drop';

  let columns = $state([
    { id: 'todo', title: 'To Do', cards: [...] },
    { id: 'doing', title: 'In Progress', cards: [...] },
    { id: 'done', title: 'Done', cards: [...] }
  ]);

  function moveCard(card, targetColumn) {
    // Move card between columns
  }

	const drag_0 = new Draggable({ plugins: [
          data({ id: card.id, type: 'card' })
        ] });

	const drop_0 = new Droppable({ plugins: [
      validation({ accept: ['card'] }),
      highlightOnDrag({ className: 'valid-target' }), // Auto-highlights when drag starts
      cardDrop({
        column: column.id,
        onDrop: (cardData) => moveCard(cardData, column)
      })
    ] });
</script>

{#each columns as column}
  <div {@attach drop_0.attachment} class="column">
    <h3>{column.title}</h3>

    {#each column.cards as card}
      <div {@attach drag_0.attachment} class="card">
        {card.title}
      </div>
    {/each}
  </div>
{/each}
```

### Kanban Board - Nested Composition

```svelte
<script>
  import { Droppable } from '@neodrag/svelte/drop';
  import {
    sortable,
    accepts,
    insertionLine,
  } from '@neodrag/svelte/drop';
  import { events, highlight } from '@neodrag/core/drop/plugins';

  let columns = $state([
    {
      id: 'todo',
      title: 'To Do',
      cards: [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' },
      ],
    },
    { id: 'doing', title: 'Doing', cards: [] },
    { id: 'done', title: 'Done', cards: [] },
  ]);

  function moveCard(cardData, targetColumn) {
    // Remove from source, add to target
    const sourceColumn = columns.find((c) =>
      c.cards.some((card) => card.id === cardData.id),
    );
    sourceColumn.cards = sourceColumn.cards.filter(
      (c) => c.id !== cardData.id,
    );
    targetColumn.cards.push(cardData);
  }

  const drop_0 = new Droppable({
    plugins: [
      sortable({
        items: () => columns,
        onReorder: (newOrder) => (columns = newOrder),
        type: 'column',
        axis: 'x',
      }),
    ],
  });
  const drop_1 = new Droppable({
    plugins: [
      sortable({
        items: () => column.cards,
        onReorder: (newOrder) => (column.cards = newOrder),
        type: 'card',
      }),
      accepts(['card']),
      events({ onDrop: (cardData) => moveCard(cardData, column) }),
      highlight({ className: 'column-highlight' }),
      insertionLine({ axis: 'y' }),
    ],
  });
</script>

<!-- Board: columns sortable horizontally -->
<div {@attach drop_0.attachment}>
  {#each columns as column}
    <div class="column">
      <h3>{column.title}</h3>

      <!-- Column: cards sortable vertically + accepts cards from other columns -->
      <div {@attach drop_1.attachment}>
        {#each column.cards as card}
          <div class="card">{card.title}</div>
        {/each}
      </div>
    </div>
  {/each}
</div>
```

## Composable Plugin Building Blocks

The power comes from combining simple, focused plugins:

```typescript
// Core building blocks - each does one thing well

accepts(['type1', 'type2']); // Accept specific drag types
rejects((data) => condition); // Reject based on custom logic
events({ onDrop: handler }); // Handle drop events
highlight({ className: 'active' }); // Visual feedback
insertionLine({ axis: 'y' }); // Show drop insertion point
sortable({ items, onReorder, type })[ // Make children sortable
  // Composition examples:

  // Simple drop zone
  (accepts(['todo']), events({ onDrop: handler }))
][
  // Highlighted drop zone
  (accepts(['todo']), highlight(), events({ onDrop: handler }))
][
  // Sortable list
  sortable({ items: () => todos, onReorder: setTodos })
][
  // Sortable list with visual feedback
  (sortable({ items: () => todos, onReorder: setTodos }),
  insertionLine())
][
  // Complex drop zone: sortable + accepts external drops + highlights
  (sortable({ items: () => items, onReorder: setItems }),
  accepts(['external-item']),
  events({ onDrop: handleExternal }),
  highlight({ className: 'drop-active' }))
];
```

## Core Plugin Building Blocks

```typescript
// accepts() - Accept specific types
accepts(['todo', 'card']);
accepts((dragData) => dragData.priority > 5);

// rejects() - Reject specific conditions
rejects((dragData) => dragData.id === currentItem.id);

// events() - Handle drop lifecycle
events({
  onDrop: (dragData) => handleDrop(dragData),
  onDragEnter: (dragData) => showPreview(dragData),
});

// highlight() - Visual feedback
highlight({ className: 'drop-active' });
highlight({ style: { backgroundColor: 'lightblue' } });

// insertionLine() - Show where item will be inserted
insertionLine({ axis: 'y' });
insertionLine({ axis: 'x', className: 'custom-line' });

// sortable() - Make children sortable
sortable({
  items: () => todos,
  onReorder: (newOrder) => (todos = newOrder),
  type: 'todo',
});
```

### Creating Custom Plugins

```typescript
// Custom analytics plugin
export const analytics = unstable_definePlugin(
  (config: { trackingId: string; events?: string[] }) => ({
    name: 'custom:analytics',
    priority: -100, // Run after other plugins

    setup(ctx) {
      console.log(
        'Analytics plugin setup for dropzone',
        ctx.dropZone,
      );
      return {
        startTime: null as number | null,
      };
    },

    enter(ctx, state, event) {
      state.startTime = Date.now();
      track('drag_enter', {
        zone: getZoneId(ctx.dropZone),
        dataType: getDataType(ctx.currentData),
      });
    },

    drop(ctx, state, event) {
      const duration = Date.now() - (state.startTime || 0);
      track('drop_complete', {
        zone: getZoneId(ctx.dropZone),
        dataType: getDataType(ctx.currentData),
        duration,
      });
    },
  }),
);

// Custom validation with external API
export const serverValidation = unstable_definePlugin(
  (config: { endpoint: string; cacheTime?: number }) => ({
    name: 'custom:server-validation',
    priority: 500,

    setup(ctx) {
      return {
        cache: new Map<string, { valid: boolean; expires: number }>(),
      };
    },

    async enter(ctx, state, event) {
      const dataKey = generateDataKey(ctx.currentData);
      const cached = state.cache.get(dataKey);

      if (cached && cached.expires > Date.now()) {
        return cached.valid ? ctx.accept() : ctx.reject();
      }

      // Show loading state
      ctx.setFeedback('Validating...');

      try {
        const response = await fetch(config.endpoint, {
          method: 'POST',
          body: JSON.stringify({ data: ctx.currentData }),
        });

        const result = await response.json();
        const isValid = result.valid;

        // Cache result
        state.cache.set(dataKey, {
          valid: isValid,
          expires: Date.now() + (config.cacheTime || 60000),
        });

        return isValid ? ctx.accept() : ctx.reject();
      } catch (error) {
        ctx.setFeedback('Validation failed');
        ctx.reject();
        return false;
      }
    },
  }),
);
```

## Event Data

### Drop Context Object

```typescript
interface DropContext {
  // Core properties
  dropZone: HTMLElement; // The drop zone element
  currentData: unknown; // Data being dragged
  isValidDrop: boolean; // Current validation state
  acceptedTypes: Set<string>; // MIME types this zone accepts

  // Drag event information
  clientPosition: { x: number; y: number }; // Mouse position
  screenPosition: { x: number; y: number }; // Screen position
  dragElement?: HTMLElement; // Source element (if internal drag)

  // Global coordination (when both drag and drop packages present)
  globalDragState?: {
    sourceData: unknown;
    sourceElement: HTMLElement;
    validTargets: Set<HTMLElement>;
    isDragging: boolean;
  };

  // Control methods
  accept(): void; // Mark drop as valid
  reject(): void; // Mark drop as invalid
  setFeedback(message: string): void; // Show user feedback

  // Effect system (same as drag plugins)
  effect: {
    immediate: (fn: () => void) => void; // Run immediately
    paint: (fn: () => void) => void; // Run on next paint
  };
}
```

### Plugin State Management

```typescript
// Plugins can maintain state across lifecycle hooks
const myPlugin = unstable_definePlugin(() => ({
  name: 'stateful-plugin',

  setup(ctx) {
    // Return initial state
    return {
      enterCount: 0,
      lastDataType: null as string | null,
      validationCache: new Map(),
    };
  },

  enter(ctx, state, event) {
    state.enterCount++;
    state.lastDataType = getDataType(ctx.currentData);

    // State persists across all lifecycle hooks
    console.log(`This is enter #${state.enterCount}`);
  },

  drop(ctx, state, event) {
    console.log(
      `Dropping ${state.lastDataType} after ${state.enterCount} enters`,
    );
  },

  cleanup(ctx, state) {
    // Clean up resources when plugin is destroyed
    state.validationCache.clear();
  },
}));
```

## Framework Integration Patterns

### React Integration

```typescript
// @neodrag/react/drop
import { useRef, useState } from 'react';
import { DropFactory } from '@neodrag/core/drop';

interface DropState {
  isValidTarget: boolean;
  isDraggedOver: boolean;
  currentData: unknown;
  feedback: string | null;
}

export function useDroppable(
  ref: React.RefObject<HTMLElement>,
  plugins: DropPlugin[] = []
): DropState {
  const [state, setState] = useState<DropState>({
    isValidTarget: false,
    isDraggedOver: false,
    currentData: null,
    feedback: null
  });

  // Auto-sync state with drop events
  const syncPlugin = useMemo(() =>
    unstable_definePlugin(() => ({
      name: 'react-state-sync',
      priority: -1000,
      cancelable: false,

      enter: (ctx) => setState(prev => ({
        ...prev,
        isDraggedOver: true,
        currentData: ctx.currentData,
        isValidTarget: ctx.isValidDrop
      })),

      leave: (ctx) => setState(prev => ({
        ...prev,
        isDraggedOver: false
      }))
    })),
    []
  );

  useEffect(() => {
    if (!ref.current) return;

    const dropFactory = new DropFactory();
    return dropFactory.droppable(ref.current, [...plugins, syncPlugin]);
  }, []);

  return state;
}

// Usage in React component
function DropZone({ onDrop }) {
  const dropRef = useRef(null);
  const dropState = useDroppable(dropRef, [
    validation({ accept: ['text/plain'] }),
    events({ onDrop })
  ]);

  return (
    <div
      ref={dropRef}
      className={`drop-zone ${dropState.isDraggedOver ? 'active' : ''}`}
    >
      {dropState.feedback || 'Drop items here'}
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div
    v-droppable="[
      validation({ accept: ['text/plain'] }),
      events({ onDrop }),
    ]"
    :class="{ 'drag-over': isDraggedOver }"
  >
    Drop items here
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { vDroppable, validation, events } from '@neodrag/vue/drop';

const isDraggedOver = ref(false);

const onDrop = (data) => {
  console.log('Dropped:', data);
  isDraggedOver.value = false;
};

// Vue directive automatically handles state management
</script>
```

### Solid Integration

```tsx
// @neodrag/solid/drop
import { onMount, createSignal } from 'solid-js';

function DropZone(props) {
  const [isDraggedOver, setIsDraggedOver] = createSignal(false);
  let dropRef;

  onMount(() => {
    const dropFactory = new DropFactory();
    const cleanup = dropFactory.droppable(dropRef, [
      validation({ accept: ['text/plain'] }),
      events({
        onEnter: () => setIsDraggedOver(true),
        onLeave: () => setIsDraggedOver(false),
        onDrop: props.onDrop,
      }),
    ]);

    onCleanup(cleanup);
  });

  return (
    <div
      ref={dropRef}
      class={isDraggedOver() ? 'drop-zone active' : 'drop-zone'}
    >
      Drop items here
    </div>
  );
}
```

## Package Structure

```
packages/
├── core/
│   └── drop/
│       ├── src/
│       │   ├── index.ts              # DropFactory, CoordinationBus
│       │   ├── plugins.ts            # Built-in drop plugins
│       │   ├── context.ts            # DropContext interface
│       │   └── types.ts              # TypeScript definitions
│       └── package.json
│
├── svelte/
│   └── drop/
│       ├── src/
│       │   ├── index.svelte.ts       # Svelte 5 attachments
│       │   ├── legacy.ts             # Svelte < 5 actions
│       │   └── shared.ts             # Shared factory instance
│       └── package.json
│
├── react/
│   └── drop/
│       ├── src/
│       │   └── index.ts              # React hooks
│       └── package.json
│
├── vue/
│   └── drop/
│       ├── src/
│       │   └── index.ts              # Vue directives & composables
│       └── package.json
│
├── solid/
│   └── drop/
│       ├── src/
│       │   └── index.ts              # Solid primitives
│       └── package.json
│
└── vanilla/
    └── drop/
        ├── src/
        │   └── index.ts              # Plain JavaScript API
        └── package.json
```

## Installation & Usage

### Installation

```bash
# Drag-only users (no change)
npm install @neodrag/svelte

# Drop functionality (opt-in)
npm install @neodrag/svelte @neodrag/svelte/drop

# Drop-only applications
npm install @neodrag/svelte/drop
```

### Basic Setup

```svelte
<script>
  import { Draggable } from '@neodrag/svelte';
  import { Droppable } from '@neodrag/svelte/drop';
  import { validation } from '@neodrag/svelte/drop';
  import { events } from '@neodrag/core/drop/plugins';

  const drag_0 = new Draggable({ plugins: [] });

  const drop_0 = new Droppable({
    plugins: [
      validation({ accept: ['text/plain'] }),
      events({ onDrop: (data) => console.log('Dropped:', data) }),
    ],
  });
</script>

<!-- Draggable element -->
<div {@attach drag_0.attachment}>Drag me</div>

<!-- Drop zone -->
<div {@attach drop_0.attachment}>Drop here</div>
```

### Bundle Size Impact

- **Drag-only apps**: No size increase (existing behavior)
- **Drop-only apps**: Only drop functionality included
- **Combined apps**: Automatic coordination between packages

## Migration

### From SortableJS

```javascript
// SortableJS (before)
const sortable = new Sortable(listElement, {
  group: 'shared',
  onEnd: function(evt) {
    // Handle reorder
  }
});

// Neodrag (after)
import { Draggable } from '@neodrag/svelte';
import { Droppable } from '@neodrag/svelte/drop';
import { sortable } from '@neodrag/svelte/drop';

const itemDrag = new Draggable({ plugins: [] });
const listDrop = new Droppable({
  plugins: [
    sortable({
      group: 'shared',
      onDrop: (data, target) => handleReorder(data, target),
    }),
  ],
});

// In Svelte component
{#each items as item}
  <div {@attach itemDrag.attachment} {@attach listDrop.attachment}>
    {item.text}
  </div>
{/each}
```

### From HTML5 Drag API

```javascript
// HTML5 (before)
element.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
});

element.addEventListener('drop', (e) => {
  e.preventDefault();
  const data = e.dataTransfer.getData('text/plain');
  handleDrop(data);
});

// Neodrag (after)
import { Droppable } from '@neodrag/svelte/drop';
import { validation, events } from '@neodrag/core/drop/plugins';

const drop = new Droppable({
  plugins: [
    validation({ accept: ['text/plain'] }),
    events({ onDrop: handleDrop }),
  ],
});

// In Svelte component
<div {@attach drop.attachment}>Drop zone</div>
```

### From react-dnd

```javascript
// react-dnd (before)
const [{ isOver }, drop] = useDrop({
  accept: 'CARD',
  drop: (item) => handleDrop(item),
  collect: (monitor) => ({
    isOver: monitor.isOver(),
  }),
});

// Neodrag (after)
import { useDroppable } from '@neodrag/react/drop';
import { validation, events } from '@neodrag/react/drop';

const dropRef = useRef(null);
const { isDraggedOver } = useDroppable(dropRef, [
  validation({ accept: ['card'] }),
  events({ onDrop: handleDrop }),
]);
```

## Conclusion

This RFC proposes a composable drop zone system built on Neodrag's plugin philosophy. The key insight is **composability over complexity** - instead of monolithic solutions, we provide small, focused plugins that work together like Lego blocks.

### Key Benefits

1. **Lego-like Composability**: Small, focused plugins that each do one thing well
2. **Emergent Complexity**: Sophisticated behaviors emerge from simple plugin combinations
3. **Bundle Size Optimization**: Drop functionality is completely optional and composable
4. **Consistent API**: Framework integration follows established Neodrag patterns
5. **No Special Cases**: Same composable approach works for simple lists and complex Kanban boards
6. **Extensibility**: Easy to create custom plugins that compose with built-in ones

### Composability Examples

```typescript
// Simple → Complex through composition

// Basic drop zone
[accepts(['todo']), events({ onDrop: handler })][
  // Add visual feedback
  (accepts(['todo']), highlight(), events({ onDrop: handler }))
][
  // Make it sortable too
  (sortable({ items, onReorder }),
  accepts(['todo']),
  events({ onDrop: handler }))
][
  // Full Kanban column
  (sortable({ items: () => cards, onReorder: setCards }),
  accepts(['card']),
  events({ onDrop: moveCard }),
  highlight(),
  insertionLine())
];
```

### Design Philosophy

Instead of asking "How do we build a Kanban component?", we ask "What simple behaviors compose to create Kanban functionality?" The answer is plugins that:

- Make things sortable
- Accept specific types
- Provide visual feedback
- Handle events

When composed together, these simple pieces create sophisticated drag-drop experiences while remaining individually simple and reusable.

This approach scales from basic drop zones to complex nested applications through **composition, not configuration**.
