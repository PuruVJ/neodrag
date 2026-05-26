import type { Framework } from '$helpers/constants';
import type { WorldId } from './worlds';

const SNIPPETS: Record<WorldId, Record<Framework, string>> = {
	'night-desk': {
		svelte: `<script lang="ts">
  import { Draggable } from '@neodrag/svelte';
  import { bounds, BoundsFrom } from '@neodrag/svelte/plugins';

  const drag = new Draggable({
    plugins: [bounds(BoundsFrom.parent())],
  });
</script>

<div class="stage">
  <div class="panel" {@attach drag.attachment}>Notes</div>
</div>`,
		react: `import { useRef } from 'react';
import { useDraggable, bounds, BoundsFrom } from '@neodrag/react';

export function NightDesk() {
  const ref = useRef<HTMLDivElement>(null);
  useDraggable(ref, { plugins: [bounds(BoundsFrom.parent())] });

  return (
    <div className="stage">
      <div ref={ref} className="panel">Notes</div>
    </div>
  );
}`,
		vue: `<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useDraggable, bounds, BoundsFrom } from '@neodrag/vue';

const panel = useTemplateRef('panel');
useDraggable(panel, { plugins: [bounds(BoundsFrom.parent())] });
</script>

<template>
  <div class="stage">
    <div ref="panel" class="panel">Notes</div>
  </div>
</template>`,
		solid: `import { bounds, BoundsFrom, createDraggable } from '@neodrag/solid';

function Panel() {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  createDraggable(ref, () => [bounds(BoundsFrom.parent())]);

  return (
    <div class="stage">
      <div ref={setRef} class="panel">Notes</div>
    </div>
  );
}`,
		vanilla: `import { Draggable, bounds, BoundsFrom } from '@neodrag/vanilla';

const panel = document.querySelector('.panel');
new Draggable(panel, { plugins: [bounds(BoundsFrom.parent())] });`,
	},
	'last-mile': empty_snippets('Route a delivery pin'),
	'split-bill': empty_snippets('Split line items'),
	'fridge-paws': empty_snippets('Stick magnets on the fridge'),
	'laser-heist': empty_snippets('Dodge the lasers'),
};

function empty_snippets(hint: string): Record<Framework, string> {
	const line = `// ${hint} — coming soon`;
	return {
		svelte: line,
		react: line,
		vue: line,
		solid: line,
		vanilla: line,
	};
}

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
