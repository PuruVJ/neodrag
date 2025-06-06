import { PluginInput } from '@neodrag/core/plugins';
import type { Action } from 'svelte/action';
import { factory } from './shared';

/** @deprecated Use `{@attach draggable}` instead */
export const legacyDraggable = factory.draggable as Action<
	HTMLElement | SVGElement,
	PluginInput | undefined
>;
