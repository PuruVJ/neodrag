import { createDraggable, DEFAULT_delegate, DEFAULT_onError, DEFAULT_plugins } from '@neodrag/core';
import type { Plugin } from '@neodrag/core/plugins';
import type { Action } from 'svelte/action';

const { draggable: core, instances } = createDraggable({
	delegate: DEFAULT_delegate,
	plugins: DEFAULT_plugins,
	onError: DEFAULT_onError,
});

export const draggable = core as Action<HTMLElement | SVGElement, Plugin[] | undefined>;
export { instances };
export * from '@neodrag/core/plugins';
