import type { WorldId } from './worlds';

export type FrameworkId = 'svelte';

const NIGHT_DESK_SVELTE = `import { Neodrag } from '@neodrag/core';
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
</div>`;

const PLACEHOLDER = `// This world is not built yet.
// Pick Night desk (moon) to play.`;

export const SNIPPETS: Record<FrameworkId, Record<WorldId, string>> = {
	svelte: {
		'night-desk': NIGHT_DESK_SVELTE,
		'last-mile': PLACEHOLDER,
		'split-bill': PLACEHOLDER,
		'fridge-paws': PLACEHOLDER,
		'laser-heist': PLACEHOLDER,
	},
};

export function get_snippet(world: WorldId, framework: FrameworkId = 'svelte') {
	return SNIPPETS[framework][world];
}
