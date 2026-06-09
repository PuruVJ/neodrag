import type { Framework } from '$helpers/constants';
import type { WorldId } from './worlds';

const SNIPPETS: Record<WorldId, Record<Framework, string>> = {
	'night-desk': {
		svelte: `<script lang="ts">
  import { draggable } from '@neodrag/svelte';

  const drag = draggable({
    bounds: 'parent',
    onDragStart: () => bringToFront(),
  });
</script>

<div class="desk">
  <div class="panel" {...drag.attach}>Notes</div>
</div>`,
		react: `import { useDraggable } from '@neodrag/react';

export function NightDesk() {
  const { ref } = useDraggable({
    bounds: 'parent',
    onDragStart: () => bringToFront(),
  });

  return (
    <div className="desk">
      <div ref={ref} className="panel">Notes</div>
    </div>
  );
}`,
		vue: `<script setup lang="ts">
import { useDraggable } from '@neodrag/vue';

const { ref } = useDraggable({
  bounds: 'parent',
  onDragStart: () => bringToFront(),
});
</script>

<template>
  <div class="desk">
    <div :ref="ref" class="panel">Notes</div>
  </div>
</template>`,
		solid: `import { createDraggable } from '@neodrag/solid';

function Panel() {
  const { ref } = createDraggable({
    bounds: 'parent',
    onDragStart: () => bringToFront(),
  });

  return (
    <div class="desk">
      <div ref={ref} class="panel">Notes</div>
    </div>
  );
}`,
		vanilla: `import { Draggable } from '@neodrag/vanilla';

const panel = document.querySelector('.panel');
const drag = new Draggable(panel, {
  bounds: 'parent',
  onDragStart: () => bringToFront(),
});`,
	},
	'last-mile': {
		svelte: `<script lang="ts">
  import { draggable, droppable } from '@neodrag/svelte';

  const van = draggable({
    bounds: 'parent',
    grid: [24, 24],
    dragData: { kind: 'van' },
  });

  const depot = droppable({
    accepts: ({ data }) => data?.kind === 'van',
  });
</script>

<div class="city">
  <span class="block" {...depot.attach}></span>
  <button class="van" {...van.attach}>🚐</button>
</div>`,
		react: `import { useDraggable } from '@neodrag/react';

export function LastMile() {
  const { ref } = useDraggable({
    bounds: 'parent',
    grid: [24, 24],
  });

  return (
    <div className="city-grid">
      <button ref={ref} className="van" type="button">
        🚐
      </button>
    </div>
  );
}`,
		vue: `<script setup lang="ts">
import { useDraggable } from '@neodrag/vue';

const { ref } = useDraggable({
  bounds: 'parent',
  grid: [24, 24],
});
</script>

<template>
  <div class="city-grid">
    <button :ref="ref" class="van" type="button">🚐</button>
  </div>
</template>`,
		solid: `import { createDraggable } from '@neodrag/solid';

function LastMile() {
  const { ref } = createDraggable({
    bounds: 'parent',
    grid: [24, 24],
  });

  return (
    <div class="city-grid">
      <button ref={ref} class="van" type="button">
        🚐
      </button>
    </div>
  );
}`,
		vanilla: `import { Draggable } from '@neodrag/vanilla';

const van = document.querySelector('.van');
const drag = new Draggable(van, {
  bounds: 'parent',
  grid: [24, 24],
});`,
	},
	'split-bill': {
		svelte: `<script lang="ts">
  import { SortableList } from '@neodrag/svelte';

  let trayItems = $state([{ id: 'latte', label: 'Latte' }]);
  let alexItems = $state([]);

  const tray = new SortableList({
    get items() { return trayItems; },
    group: 'split-bill',
    axis: 'x',
    onReorder: (next) => (trayItems = next),
    onTransfer: (op) => transfer(op.item, 'tray', op.to),
  });
  const alex = new SortableList({
    get items() { return alexItems; },
    group: 'split-bill',
    onReorder: (next) => (alexItems = next),
    onTransfer: (op) => transfer(op.item, 'alex', op.to),
  });
</script>

<ul {...tray.attach}>
  {#each trayItems as row (row.id)}
    <li {...tray.row(row)}><button type="button">{row.label}</button></li>
  {/each}
</ul>

<ul {...alex.attach}>
  {#each alexItems as row (row.id)}
    <li {...alex.row(row)}><button type="button">{row.label}</button></li>
  {/each}
</ul>`,
		react: `import { useDraggable, useDroppable } from '@neodrag/react';

export function SplitBill() {
  const chip = useDraggable({ dragData: { id: 'latte' } });
  const alex = useDroppable({
    accepts: ({ data }) => Boolean(data?.id),
    onDrop: ({ data }) => assignToAlex(data.id),
  });

  return (
    <>
      <button ref={chip.ref} className="chip" type="button">
        Latte
      </button>
      <div ref={alex.ref} className="friend">
        Alex
      </div>
    </>
  );
}`,
		vue: `<script setup lang="ts">
import { useDraggable, useDroppable } from '@neodrag/vue';

const chip = useDraggable({ dragData: { id: 'latte' } });
const alex = useDroppable({
  accepts: ({ data }) => Boolean(data?.id),
  onDrop: ({ data }) => assignToAlex(data.id),
});
</script>

<template>
  <button :ref="chip.ref" class="chip" type="button">Latte</button>
  <div :ref="alex.ref" class="friend">Alex</div>
</template>`,
		solid: `import { createDraggable, createDroppable } from '@neodrag/solid';

function SplitBill() {
  const chip = createDraggable({ dragData: { id: 'latte' } });
  const alex = createDroppable({
    accepts: ({ data }) => Boolean(data?.id),
    onDrop: ({ data }) => assignToAlex(data.id),
  });

  return (
    <>
      <button ref={chip.ref} class="chip" type="button">
        Latte
      </button>
      <div ref={alex.ref} class="friend">
        Alex
      </div>
    </>
  );
}`,
		vanilla: `import { Draggable, Droppable } from '@neodrag/vanilla';

const chip = new Draggable(document.querySelector('.chip'), {
  dragData: { id: 'latte' },
});

const alex = new Droppable(document.querySelector('.friend'), {
  accepts: ({ data }) => Boolean(data?.id),
  onDrop: ({ data }) => assignToAlex(data.id),
});`,
	},
	'fridge-paws': {
		svelte: `<script lang="ts">
  import { SortableList } from '@neodrag/svelte';

  let words = $state(['purr', 'snack', 'meow']);

  const list = new SortableList({
    get items() { return words; },
    axis: 'y',
    onReorder: (next) => (words = next),
  });
</script>

<ul {...list.attach}>
  {#each words as word (word)}
    <li {...list.row(word)}><button type="button">{word}</button></li>
  {/each}
</ul>`,
		react: `import { useState } from 'react';
import { useSortable } from '@neodrag/react';

export function FridgePaws() {
  const [words, setWords] = useState(['purr', 'snack', 'meow']);
  const { ref, row } = useSortable({
    items: words,
    axis: 'y',
    onReorder: setWords,
  });

  return (
    <ul ref={ref}>
      {words.map((word) => (
        <li key={word} {...row(word)}>{word}</li>
      ))}
    </ul>
  );
}`,
		vue: `<script setup lang="ts">
import { ref } from 'vue';
import { useSortable } from '@neodrag/vue';

const words = ref(['purr', 'snack', 'meow']);
const { ref: listRef, row } = useSortable({
  get items() { return words.value; },
  axis: 'y',
  onReorder: (next) => (words.value = next),
});
</script>

<template>
  <ul :ref="listRef">
    <li v-for="word in words" :key="word" v-bind="row(word)">{{ word }}</li>
  </ul>
</template>`,
		solid: `import { createSignal, For } from 'solid-js';
import { createSortable } from '@neodrag/solid';

function FridgePaws() {
  const [words, setWords] = createSignal(['purr', 'snack', 'meow']);
  const { ref, row } = createSortable({
    get items() { return words(); },
    axis: 'y',
    onReorder: setWords,
  });

  return (
    <ul ref={ref}>
      <For each={words()}>{(word) => <li {...row(word)}>{word}</li>}</For>
    </ul>
  );
}`,
		vanilla: `import { SortableList } from '@neodrag/vanilla';

let words = ['purr', 'snack', 'meow'];
const listEl = document.querySelector('.magnet-list');

const list = new SortableList(listEl, {
  items: words,
  axis: 'y',
  onReorder: (next) => {
    words = next;
    list.update({ items: words });
  },
});`,
	},
	'laser-heist': {
		svelte: `<script lang="ts">
  import { SortableList } from '@neodrag/svelte';

  let cards = $state([{ id: 'c1', label: 'Case the vault', column: 'plan' }]);
  const planCards = $derived(cards.filter((c) => c.column === 'plan'));

  const plan = new SortableList({
    get items() { return planCards; },
    group: 'heist-board',
    axis: 'y',
    onReorder: (next) => writeColumn('plan', next),
    onTransfer: (op) =>
      (cards = cards.map((c) => (c.id === op.item.id ? { ...c, column: 'plan' } : c))),
  });
</script>

<section {...plan.attach}>
  {#each planCards as card (card.id)}
    <button {...plan.row(card)}>{card.label}</button>
  {/each}
</section>`,
		react: `import { useSortable } from '@neodrag/react';

function PlanColumn({ planCards, setCards }) {
  const { ref, row } = useSortable({
    items: planCards,
    group: 'heist-board',
    axis: 'y',
    onReorder: (next) => writeColumn('plan', next),
    onTransfer: (op) =>
      setCards((cards) =>
        cards.map((c) => (c.id === op.item.id ? { ...c, column: 'plan' } : c)),
      ),
  });

  return (
    <section ref={ref}>
      {planCards.map((card) => (
        <button key={card.id} {...row(card)}>{card.label}</button>
      ))}
    </section>
  );
}`,
		vue: `<script setup lang="ts">
import { useSortable } from '@neodrag/vue';

const props = defineProps(['planCards']);
const { ref: listRef, row } = useSortable({
  get items() { return props.planCards; },
  group: 'heist-board',
  axis: 'y',
  onReorder: (next) => writeColumn('plan', next),
  onTransfer: (op) =>
    (cards.value = cards.value.map((c) =>
      c.id === op.item.id ? { ...c, column: 'plan' } : c,
    )),
});
</script>

<template>
  <section :ref="listRef">
    <button v-for="card in planCards" :key="card.id" v-bind="row(card)">
      {{ card.label }}
    </button>
  </section>
</template>`,
		solid: `import { For } from 'solid-js';
import { createSortable } from '@neodrag/solid';

function PlanColumn(props) {
  const { ref, row } = createSortable({
    get items() { return props.planCards; },
    group: 'heist-board',
    axis: 'y',
    onReorder: (next) => writeColumn('plan', next),
    onTransfer: (op) =>
      setCards((cards) =>
        cards.map((c) => (c.id === op.item.id ? { ...c, column: 'plan' } : c)),
      ),
  });

  return (
    <section ref={ref}>
      <For each={props.planCards}>
        {(card) => <button {...row(card)}>{card.label}</button>}
      </For>
    </section>
  );
}`,
		vanilla: `import { SortableList } from '@neodrag/vanilla';

const plan = new SortableList(document.querySelector('.plan'), {
  items: inColumn('plan'),
  group: 'heist-board',
  onReorder: (next) => writeColumn('plan', next),
  onTransfer: (op) => {
    cards = cards.map((c) =>
      c.id === op.item.id ? { ...c, column: 'plan' } : c,
    );
    plan.update({ items: inColumn('plan') });
  },
});`,
	},
	'sticker-grid': {
		svelte: `<script lang="ts">
  import { SortableList } from '@neodrag/svelte';

  let tiles = $state([
    { id: 'star', emoji: '⭐' },
    { id: 'gem', emoji: '💎' },
  ]);

  const grid = new SortableList({
    get items() { return tiles; },
    strategy: 'grid',
    onReorder: (next) => (tiles = next),
  });
</script>

<div class="board" {...grid.attach}>
  {#each tiles as tile (tile.id)}
    <button {...grid.row(tile)}>{tile.emoji}</button>
  {/each}
</div>`,
		react: `import { useState } from 'react';
import { useSortable } from '@neodrag/react';

export function StickerGrid() {
  const [tiles, setTiles] = useState([
    { id: 'star', emoji: '⭐' },
    { id: 'gem', emoji: '💎' },
  ]);
  const { ref, row } = useSortable({
    items: tiles,
    strategy: 'grid',
    onReorder: setTiles,
  });

  return (
    <div className="board" ref={ref}>
      {tiles.map((tile) => (
        <button key={tile.id} {...row(tile)}>{tile.emoji}</button>
      ))}
    </div>
  );
}`,
		vue: `<script setup lang="ts">
import { ref } from 'vue';
import { useSortable } from '@neodrag/vue';

const tiles = ref([
  { id: 'star', emoji: '⭐' },
  { id: 'gem', emoji: '💎' },
]);
const { ref: boardRef, row } = useSortable({
  get items() { return tiles.value; },
  strategy: 'grid',
  onReorder: (next) => (tiles.value = next),
});
</script>

<template>
  <div class="board" :ref="boardRef">
    <button v-for="tile in tiles" :key="tile.id" v-bind="row(tile)">
      {{ tile.emoji }}
    </button>
  </div>
</template>`,
		solid: `import { createSignal, For } from 'solid-js';
import { createSortable } from '@neodrag/solid';

function StickerGrid() {
  const [tiles, setTiles] = createSignal([
    { id: 'star', emoji: '⭐' },
    { id: 'gem', emoji: '💎' },
  ]);
  const { ref, row } = createSortable({
    get items() { return tiles(); },
    strategy: 'grid',
    onReorder: setTiles,
  });

  return (
    <div class="board" ref={ref}>
      <For each={tiles()}>{(tile) => <button {...row(tile)}>{tile.emoji}</button>}</For>
    </div>
  );
}`,
		vanilla: `import { SortableList } from '@neodrag/vanilla';

let tiles = [
  { id: 'star', emoji: '⭐' },
  { id: 'gem', emoji: '💎' },
];

const grid = new SortableList(document.querySelector('.board'), {
  items: tiles,
  strategy: 'grid',
  onReorder: (next) => {
    tiles = next;
    grid.update({ items: tiles });
  },
});`,
	},
	'realtime-collab': {
		svelte: `import { SortableList, MemoryCollab, bindCollab } from '@neodrag/core';

const a = new MemoryCollab(), b = new MemoryCollab();
a.connect(b);
bindCollab(new SortableList(elA, { items: A, onReorder: setA }), a);
bindCollab(new SortableList(elB, { items: B, onReorder: setB }), b);`,
		react: `const a = new MemoryCollab(), b = new MemoryCollab();
a.connect(b);
bindCollab(listA, a);
bindCollab(listB, b);`,
		vue: `const a = new MemoryCollab(), b = new MemoryCollab();
a.connect(b);
bindCollab(listA, a);
bindCollab(listB, b);`,
		solid: `const a = new MemoryCollab(), b = new MemoryCollab();
a.connect(b);
bindCollab(listA, a);
bindCollab(listB, b);`,
		vanilla: `const a = new MemoryCollab(), b = new MemoryCollab();
a.connect(b);
bindCollab(new SortableList(elA, { items: A, onReorder: setA }), a);
bindCollab(new SortableList(elB, { items: B, onReorder: setB }), b);`,
	},
	'indicator-switch': {
		svelte: `const list = new SortableList({
  get items() { return tracks; },
  get indicator() { return mode; },
  onReorder: (n) => (tracks = n),
});`,
		react: `const { ref, row } = useSortable({ items: tracks, indicator: mode, onReorder: setTracks });`,
		vue: `const { ref, row } = useSortable({
  get items() { return tracks.value; },
  get indicator() { return mode.value; },
  onReorder: (n) => (tracks.value = n),
});`,
		solid: `const { ref, row } = createSortable({
  get items() { return tracks(); },
  get indicator() { return mode(); },
  onReorder: setTracks,
});`,
		vanilla: `const list = new SortableList(el, { items: tracks, indicator: 'line', onReorder: render });`,
	},
	'resize-desk': {
		svelte: `const resize = new Resizable({ minWidth: 120, maxWidth: 360 });

<div {...resize.attach}>
  <span data-neodrag-resize-handle="se"></span>
</div>`,
		react: `const { ref } = useResizable({ minWidth: 120, maxWidth: 360 });

<div ref={ref}><span data-neodrag-resize-handle="se" /></div>`,
		vue: `const { ref } = useResizable({ minWidth: 120, maxWidth: 360 });

<div :ref="ref"><span data-neodrag-resize-handle="se" /></div>`,
		solid: `const { ref } = createResizable({ minWidth: 120, maxWidth: 360 });

<div ref={ref}><span data-neodrag-resize-handle="se" /></div>`,
		vanilla: `new Resizable(box, { minWidth: 120, maxWidth: 360 });`,
	},
	'extras-bench': {
		svelte: `const drag = new Draggable({ use: [magnetic(points, 42)] });`,
		react: `const { ref } = useDraggable({ use: [magnetic(points, 42)] });`,
		vue: `const { ref } = useDraggable({ use: [magnetic(points, 42)] });`,
		solid: `const { ref } = createDraggable({ use: [magnetic(points, 42)] });`,
		vanilla: `new Draggable(box, { use: [magnetic(points, 42)] });`,
	},
};

export function get_snippet(world: WorldId, framework: Framework): string {
	return SNIPPETS[world][framework];
}

export const LANG_BY_FRAMEWORK: Record<Framework, string> = {
	svelte: 'svelte',
	react: 'tsx',
	vue: 'vue',
	solid: 'jsx',
	vanilla: 'ts',
};
