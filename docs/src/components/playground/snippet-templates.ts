import type { Framework } from '$helpers/constants';
import type { WorldId } from './worlds';

const SNIPPETS: Record<WorldId, Record<Framework, string>> = {
	'night-desk': {
		svelte: `<script lang="ts">
  import { Draggable } from '@neodrag/svelte';
  import { bounds, BoundsFrom } from '@neodrag/svelte/plugins';

  const drag = new Draggable({
    plugins: [bounds(BoundsFrom.parent())],
    onDragStart: () => bringToFront(),
  });
</script>

<div class="desk">
  <div class="panel" {...drag.target}>Notes</div>
</div>`,
		react: `import { useRef } from 'react';
import { bounds, BoundsFrom, events, useDraggable } from '@neodrag/react';

export function NightDesk() {
  const ref = useRef<HTMLDivElement>(null);
  useDraggable(ref, {
    plugins: [
      bounds(BoundsFrom.parent()),
      events({ onDragStart: () => bringToFront() }),
    ],
  });

  return (
    <div className="desk">
      <div ref={ref} className="panel">Notes</div>
    </div>
  );
}`,
		vue: `<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { bounds, BoundsFrom, events, useDraggable } from '@neodrag/vue';

const panel = useTemplateRef('panel');
useDraggable(panel, {
  plugins: [
    bounds(BoundsFrom.parent()),
    events({ onDragStart: () => bringToFront() }),
  ],
});
</script>

<template>
  <div class="desk">
    <div ref="panel" class="panel">Notes</div>
  </div>
</template>`,
		solid: `import { createSignal } from 'solid-js';
import { createDraggable } from '@neodrag/solid';
import { bounds, BoundsFrom } from '@neodrag/solid/plugins';

function Panel() {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  createDraggable(ref, () => [bounds(BoundsFrom.parent())]);

  return (
    <div class="desk">
      <div ref={setRef} class="panel">Notes</div>
    </div>
  );
}`,
		vanilla: `import { Draggable } from '@neodrag/vanilla';
import { bounds, BoundsFrom } from '@neodrag/vanilla/plugins';

const panel = document.querySelector('.panel');
const drag = new Draggable({
  plugins: [bounds(BoundsFrom.parent())],
  onDragStart: () => bringToFront(),
});
drag.attach(panel);`,
	},
	'last-mile': {
		svelte: `<script lang="ts">
  import { Draggable } from '@neodrag/svelte';
  import { Droppable, accepts, highlight } from '@neodrag/svelte/drop';
  import { bounds, BoundsFrom, dragData, grid } from '@neodrag/svelte/plugins';

  const van = new Draggable({
    plugins: [
      bounds(BoundsFrom.parent()),
      grid([24, 24]),
      dragData(() => ({ kind: 'van' })),
    ],
  });

  const depot = new Droppable({
    plugins: [
      accepts((d) => d.kind === 'van'),
      highlight({ overClass: 'pg-drop-over--success' }),
    ],
  });
</script>

<div class="city">
  <span class="block" {@attach depot.attachment}></span>
  <button class="van" {@attach van.attachment}>🚐</button>
</div>`,
		react: `import { useRef } from 'react';
import { bounds, BoundsFrom, grid, useDraggable } from '@neodrag/react';

export function LastMile() {
  const vanRef = useRef<HTMLButtonElement>(null);
  useDraggable(vanRef, {
    plugins: [bounds(BoundsFrom.parent()), grid([24, 24])],
  });

  return (
    <div className="city-grid">
      <button ref={vanRef} className="van" type="button">
        🚐
      </button>
    </div>
  );
}`,
		vue: `<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { bounds, BoundsFrom, grid, useDraggable } from '@neodrag/vue';

const van = useTemplateRef('van');
useDraggable(van, {
  plugins: [bounds(BoundsFrom.parent()), grid([24, 24])],
});
</script>

<template>
  <div class="city-grid">
    <button ref="van" class="van" type="button">🚐</button>
  </div>
</template>`,
		solid: `import { createSignal } from 'solid-js';
import { createDraggable } from '@neodrag/solid';
import { bounds, BoundsFrom, grid } from '@neodrag/solid/plugins';

function LastMile() {
  const [van, setVan] = createSignal<HTMLButtonElement>();
  createDraggable(van, () => [bounds(BoundsFrom.parent()), grid([24, 24])]);

  return (
    <div class="city-grid">
      <button ref={setVan} class="van" type="button">
        🚐
      </button>
    </div>
  );
}`,
		vanilla: `import { Draggable } from '@neodrag/vanilla';
import { bounds, BoundsFrom, grid } from '@neodrag/vanilla/plugins';

const van = document.querySelector('.van');
const drag = new Draggable({
  plugins: [bounds(BoundsFrom.parent()), grid([24, 24])],
});
drag.attach(van);`,
	},
	'split-bill': {
		svelte: `<script lang="ts">
  import {
    applyGroupedSortableTransfer,
    highlight,
    sortable,
  } from '@neodrag/svelte/drop';

  const tray = new Sortable({
    items: () => trayItems,
    keyBy: (row) => row.id,
    group: 'split-bill',
    strategy: 'horizontal',
    onReorder: (next) => { trayItems = next; },
    onTransfer: (item, meta) => transfer(item, 'tray', meta.toIndex),
  });

  const alex = new Sortable({
    items: () => alexItems,
    keyBy: (row) => row.id,
    group: 'split-bill',
    strategy: () => (narrow ? 'vertical' : 'horizontal'),
    onReorder: (next) => { alexItems = next; },
    onTransfer: (item, meta) => transfer(item, 'alex', meta.toIndex),
  });
</script>

<ul {...tray.container(highlight({ overClass: 'pg-drop-over' }))}>
  {#each trayItems as row (row.id)}
    <li {...tray.row()}>
      <button type="button" {...tray.item(row.id)}>{row.label}</button>
    </li>
  {/each}
</ul>

<ul {...alex.container(highlight({ overClass: 'pg-drop-over' }))}>
  {#each alexItems as row (row.id)}
    <li {...alex.row()}>
      <button type="button" {...alex.item(row.id)}>{row.label}</button>
    </li>
  {/each}
</ul>`,
		react: `import { useRef } from 'react';
import { dragData, useDraggable } from '@neodrag/react';
import {
  accepts,
  highlight,
  onDrop,
  useDroppable,
} from '@neodrag/react/drop';

export function SplitBill() {
  const chipRef = useRef<HTMLButtonElement>(null);
  const alexRef = useRef<HTMLDivElement>(null);

  useDraggable(chipRef, { plugins: [dragData(() => ({ id: 'latte' }))] });
  useDroppable(alexRef, {
    plugins: [
      highlight({ overClass: 'pg-drop-over' }),
      accepts((data) => Boolean(data?.id)),
      onDrop((data) => assignToAlex(data.id)),
    ],
  });

  return (
    <>
      <button ref={chipRef} className="chip" type="button">
        Latte
      </button>
      <div ref={alexRef} className="friend">
        Alex
      </div>
    </>
  );
}`,
		vue: `<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { dragData, useDraggable } from '@neodrag/vue';
import {
  accepts,
  highlight,
  onDrop,
  useDroppable,
} from '@neodrag/vue/drop';

const chip = useTemplateRef('chip');
const alex = useTemplateRef('alex');

useDraggable(chip, { plugins: [dragData(() => ({ id: 'latte' }))] });
useDroppable(alex, {
  plugins: [
    highlight({ overClass: 'pg-drop-over' }),
    accepts((data) => Boolean(data?.id)),
    onDrop((data) => assignToAlex(data.id)),
  ],
});
</script>

<template>
  <button ref="chip" class="chip" type="button">Latte</button>
  <div ref="alex" class="friend">Alex</div>
</template>`,
		solid: `import { createSignal } from 'solid-js';
import { createDraggable, createDroppable } from '@neodrag/solid';
import { dragData } from '@neodrag/solid/plugins';
import { accepts, highlight, onDrop } from '@neodrag/solid/drop';

function SplitBill() {
  const [chip, setChip] = createSignal<HTMLButtonElement>();
  const [alex, setAlex] = createSignal<HTMLDivElement>();

  createDraggable(chip, () => [dragData(() => ({ id: 'latte' }))]);
  createDroppable(alex, () => [
    highlight({ overClass: 'pg-drop-over' }),
    accepts((data) => Boolean(data?.id)),
    onDrop((data) => assignToAlex(data.id)),
  ]);

  return (
    <>
      <button ref={setChip} class="chip" type="button">
        Latte
      </button>
      <div ref={setAlex} class="friend">
        Alex
      </div>
    </>
  );
}`,
		vanilla: `import { Draggable, Droppable } from '@neodrag/vanilla';
import { dragData } from '@neodrag/vanilla/plugins';
import { accepts, highlight, onDrop } from '@neodrag/vanilla/drop';

const chip = new Draggable({
  plugins: [dragData(() => ({ id: 'latte' }))],
});
chip.attach(document.querySelector('.chip'));

const alex = new Droppable({
  plugins: [
    highlight({ overClass: 'pg-drop-over' }),
    accepts((data) => Boolean(data?.id)),
    onDrop((data) => assignToAlex(data.id)),
  ],
});
alex.attach(document.querySelector('.friend'));`,
	},
	'fridge-paws': {
		svelte: `<script lang="ts">
  import { Sortable } from '@neodrag/svelte/drop';

  let words = $state(['purr', 'snack', 'meow']);

  const list = new Sortable({
    items: () => words,
    keyBy: (word) => word,
    mode: 'swap',
    onReorder: (next) => {
      words = next;
    },
    strategy: 'vertical',
  });
</script>

<ul {...list.container}>
  {#each words as word (word)}
    <li {...list.row()}>
      <button type="button" {...list.item(word).target}>{word}</button>
    </li>
  {/each}
</ul>`,
		react: `import { useState } from 'react';
import { useSortable, useSortableItem } from '@neodrag/react/drop';

export function FridgePaws() {
  const [words, setWords] = useState(['purr', 'snack', 'meow']);
  const { list, dropRef } = useSortable({
    items: words,
    keyBy: (word) => word,
    onReorder: setWords,
    strategy: 'vertical',
  });

  return (
    <ul ref={dropRef}>
      {words.map((word) => (
        <SortableMagnet key={word} list={list} word={word} />
      ))}
    </ul>
  );
}

function SortableMagnet({ list, word }) {
  const { ref } = useSortableItem(list, word);
  return <li ref={ref}>{word}</li>;
}`,
		vue: `<script setup lang="ts">
import { ref } from 'vue';
import { Neodrag } from '@neodrag/core';
import { Sortable } from '@neodrag/vue/drop';

const words = ref(['purr', 'snack', 'meow']);
const list = new Sortable({
  items: () => words.value,
  keyBy: (word) => word,
  onReorder: (next) => {
    words.value = next;
  },
  strategy: 'vertical',
});
</script>

<template>
  <ul v-droppable="list.container">
    <li
      v-for="word in words"
      :key="word"
      v-draggable="list.item(word).target"
    >
      {{ word }}
    </li>
  </ul>
</template>`,
		solid: `import { createSignal, For } from 'solid-js';
import { createSortable, createSortableItem } from '@neodrag/solid/sortable';

function FridgePaws() {
  const [words, setWords] = createSignal(['purr', 'snack', 'meow']);
  const { list, dropRef } = createSortable({
    items: words,
    keyBy: (word) => word,
    onReorder: (next) => setWords(next),
    strategy: 'vertical',
  });

  return (
    <ul ref={dropRef}>
      <For each={words()}>
        {(word) => <Magnet list={list} word={word} />}
      </For>
    </ul>
  );
}

function Magnet(props) {
  const [, ref] = createSortableItem(props.list, props.word);
  return <li ref={ref}>{props.word}</li>;
}`,
		vanilla: `import { Draggable, Droppable } from '@neodrag/vanilla';
import { Sortable } from '@neodrag/vanilla/sortable';

const words = ['purr', 'snack', 'meow'];
const list = new Sortable({
  items: () => words,
  keyBy: (word) => word,
  onReorder: (next) => {
    words.splice(0, words.length, ...next);
  },
  strategy: 'vertical',
});

const listEl = document.querySelector('.magnet-list');
const zone = new Droppable({ plugins: list.container() });
zone.attach(listEl);
for (const word of words) {
  const el = listEl.querySelector(\`[data-word="\${word}"]\`);
  const chip = new Draggable({ plugins: list.item(word) });
  chip.attach(el);
}`,
	},
	'laser-heist': {
		svelte: `<script lang="ts">
  import { Neodrag } from '@neodrag/svelte';
  import { applyGroupedSortableTransfer, Sortable } from '@neodrag/svelte/drop';

  const plan = new Sortable({
    items: () => inColumn('plan'),
    keyBy: (card) => card.id,
    group: 'heist-board',
    onReorder: (next) => writeColumn('plan', next),
    onTransfer: (card, meta) => {
      cards = applyGroupedSortableTransfer(cards, card, {
        toIndex: meta.toIndex,
        column: 'plan',
        columnOf: (row) => row.column,
        withColumn: (row, col) => ({ ...row, column: col }),
      });
    },
  });
</script>

<section {@attach bindPlanColumn}>
  {#each inColumn('plan') as card}
    <button {@attach (n) => bindCard(n, plan, card.id)}>{card.label}</button>
  {/each}
</section>`,
		react: `import { useSortable, useSortableItem } from '@neodrag/react/drop';
import { applyGroupedSortableTransfer } from '@neodrag/core/sortable';

const { list, dropRef } = useSortable({
  items: planCards,
  keyBy: (card) => card.id,
  group: 'heist-board',
  onReorder: setPlanCards,
  onTransfer: (card, meta) => {
    setCards(applyGroupedSortableTransfer(cards, card, {
      toIndex: meta.toIndex,
      column: 'plan',
      columnOf: (row) => row.column,
      withColumn: (row, col) => ({ ...row, column: col }),
    }));
  },
});

return (
  <section ref={dropRef}>
    {planCards.map((card) => (
      <HeistCard key={card.id} list={list} id={card.id} label={card.label} />
    ))}
  </section>
);`,
		vue: `<script setup lang="ts">
import { applyGroupedSortableTransfer, Sortable } from '@neodrag/vue/drop';

const plan = new Sortable({
  items: () => inColumn('plan'),
  keyBy: (card) => card.id,
  group: 'heist-board',
  onReorder: (next) => writeColumn('plan', next),
  onTransfer: (card, meta) => {
    cards.value = applyGroupedSortableTransfer(cards.value, card, {
      toIndex: meta.toIndex,
      column: 'plan',
      columnOf: (row) => row.column,
      withColumn: (row, col) => ({ ...row, column: col }),
    });
  },
});
</script>

<section v-droppable="plan.container()">
  <button
    v-for="card in planCards"
    :key="card.id"
    v-draggable="plan.item(card.id)"
  >
    {{ card.label }}
  </button>
</section>`,
		solid: `import {
  createSortable,
  createSortableItem,
  applyGroupedSortableTransfer,
} from '@neodrag/solid/sortable';

const { list, dropRef } = createSortable({
  items: planCards,
  keyBy: (card) => card.id,
  group: 'heist-board',
  onReorder: (next) => setPlanCards(next),
  onTransfer: (card, meta) => {
    setCards(applyGroupedSortableTransfer(cards(), card, {
      toIndex: meta.toIndex,
      column: 'plan',
      columnOf: (row) => row.column,
      withColumn: (row, col) => ({ ...row, column: col }),
    }));
  },
});

return (
  <section ref={dropRef}>
    <For each={planCards()}>
      {(card) => <HeistCard list={list} card={card} />}
    </For>
  </section>
);`,
		vanilla: `import { Droppable } from '@neodrag/vanilla';
import {
  applyGroupedSortableTransfer,
  Sortable,
} from '@neodrag/vanilla/sortable';

const plan = new Sortable({
  items: () => inColumn('plan'),
  keyBy: (card) => card.id,
  group: 'heist-board',
  onReorder: (next) => writeColumn('plan', next),
  onTransfer: (card, meta) => {
    cards = applyGroupedSortableTransfer(cards, card, {
      toIndex: meta.toIndex,
      column: 'plan',
      columnOf: (row) => row.column,
      withColumn: (row, col) => ({ ...row, column: col }),
    });
  },
});

const zone = new Droppable({ plugins: plan.container() });
zone.attach(document.querySelector('.plan'));`,
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
