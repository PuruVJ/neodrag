import { createDraggable } from '@neodrag/core';
import type { PluginInput } from '@neodrag/core/plugins';
import type { Action } from 'svelte/action';

const { draggable: core, instances } = createDraggable();

export const draggable = core as Action<HTMLElement | SVGElement, PluginInput | undefined>;

export * from '@neodrag/core/plugins';
export { instances };
