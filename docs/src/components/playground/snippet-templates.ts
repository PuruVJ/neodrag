import type { FrameworkId } from './frameworks';
import type { WorldId } from './worlds';

const PLACEHOLDER = `// This world is not built yet.
// Pick Night desk (moon) to play.`;

const NIGHT_DESK: Record<FrameworkId, string> = {
	svelte: `import { Neodrag } from '@neodrag/core';
import { Draggable } from '@neodrag/svelte';
import { ControlFrom, controls } from '@neodrag/svelte/plugins';
import { Resizable, resizeHandles } from '@neodrag/svelte/resize';

const engine = new Neodrag();
const drag = new Draggable({
  engine,
  plugins: [controls({ allow: ControlFrom.selector('[data-window-drag]') })],
});
const resize = new Resizable({
  engine,
  plugins: [resizeHandles({ edges: 'all', size: 10, cornerSize: 22 })],
});

<div class="window" {@attach drag.attachment} {@attach resize.attachment}>
  <header data-window-drag>…</header>
</div>`,

	react: `import { Neodrag } from '@neodrag/core';
import { useDraggable, useResizable } from '@neodrag/react';
import { ControlFrom, controls } from '@neodrag/react/plugins';
import { resizeHandles } from '@neodrag/core/resize';

const engine = new Neodrag();

function Window() {
  const { ref: dragRef } = useDraggable([
    controls({ allow: ControlFrom.selector('[data-window-drag]') }),
  ]);
  const { ref: resizeRef } = useResizable([
    resizeHandles({ edges: 'all', size: 10, cornerSize: 22 }),
  ]);
  const ref = (node: HTMLDivElement | null) => {
    dragRef(node);
    resizeRef(node);
  };
  return <div ref={ref} className="window">…</div>;
}`,

	vue: `<script setup>
import { Draggable, Resizable, vDraggable, vResizable } from '@neodrag/vue';
import { ControlFrom, controls } from '@neodrag/vue/plugins';
import { resizeHandles } from '@neodrag/core/resize';

const drag = new Draggable({
  plugins: [controls({ allow: ControlFrom.selector('[data-window-drag]') })],
});
const resize = new Resizable({
  plugins: [resizeHandles({ edges: 'all', size: 10, cornerSize: 22 })],
});
</script>

<template>
  <div v-draggable="drag" v-resizable="resize" class="window">
    <header data-window-drag>…</header>
  </div>
</template>`,

	solid: `import { Draggable, Resizable } from '@neodrag/solid';
import { ControlFrom, controls } from '@neodrag/solid/plugins';
import { resizeHandles } from '@neodrag/core/resize';

const drag = new Draggable({
  plugins: [controls({ allow: ControlFrom.selector('[data-window-drag]') })],
});
const resize = new Resizable({
  plugins: [resizeHandles({ edges: 'all', size: 10, cornerSize: 22 })],
});

<div
  class="window"
  ref={(el) => {
    drag.attach(el);
    resize.attach(el);
  }}
>
  <header data-window-drag>…</header>
</div>`,

	vanilla: `import { Draggable, Resizable } from '@neodrag/vanilla';
import { ControlFrom, controls } from '@neodrag/vanilla/plugins';
import { resizeHandles } from '@neodrag/core/resize';

const drag = new Draggable({
  plugins: [controls({ allow: ControlFrom.selector('[data-window-drag]') })],
});
const resize = new Resizable({
  plugins: [resizeHandles({ edges: 'all', size: 10, cornerSize: 22 })],
});

const el = document.querySelector('.window')!;
drag.attach(el);
resize.attach(el);`,
};

function placeholder_for(framework: FrameworkId): string {
	return `${PLACEHOLDER}\n\n// ${framework} snippet lands when this world ships.`;
}

export const SNIPPETS: Record<FrameworkId, Record<WorldId, string>> = {
	svelte: {
		'night-desk': NIGHT_DESK.svelte,
		'last-mile': PLACEHOLDER,
		'split-bill': PLACEHOLDER,
		'fridge-paws': PLACEHOLDER,
		'laser-heist': PLACEHOLDER,
	},
	react: {
		'night-desk': NIGHT_DESK.react,
		'last-mile': PLACEHOLDER,
		'split-bill': PLACEHOLDER,
		'fridge-paws': PLACEHOLDER,
		'laser-heist': PLACEHOLDER,
	},
	vue: {
		'night-desk': NIGHT_DESK.vue,
		'last-mile': PLACEHOLDER,
		'split-bill': PLACEHOLDER,
		'fridge-paws': PLACEHOLDER,
		'laser-heist': PLACEHOLDER,
	},
	solid: {
		'night-desk': NIGHT_DESK.solid,
		'last-mile': PLACEHOLDER,
		'split-bill': PLACEHOLDER,
		'fridge-paws': PLACEHOLDER,
		'laser-heist': PLACEHOLDER,
	},
	vanilla: {
		'night-desk': NIGHT_DESK.vanilla,
		'last-mile': PLACEHOLDER,
		'split-bill': PLACEHOLDER,
		'fridge-paws': PLACEHOLDER,
		'laser-heist': PLACEHOLDER,
	},
};

/** Add per-world snippets under SNIPPETS[framework][worldId]. */
export function get_snippet(world: WorldId, framework: FrameworkId) {
	return SNIPPETS[framework][world] ?? placeholder_for(framework);
}
