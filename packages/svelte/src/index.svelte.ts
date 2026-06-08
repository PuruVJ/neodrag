// @ts-nocheck
import { Neodrag, type ResizePluginList, type EngineOptions } from '@neodrag/core';

export type NeodragOptions = EngineOptions;
export { Neodrag, Resizable as ResizableCore, Draggable as DraggableCore } from '@neodrag/core';
export type { ResizePluginList };
export { createReactiveMarkup, ReactiveMarkupAdapter } from './markup.svelte.ts';
export { Draggable, type DraggableOptions, type DragEventData } from './draggable.svelte.ts';
export {
	NEODRAG_ATTACH_KEY,
	bindingProps,
	bindingSpread,
	propsWithAttachment,
	type DraggableTargetOptions,
	type DroppableZoneOptions,
	type ResizableFrameOptions,
	type NeodragElementProps,
	type NeodragSpreadProps,
} from './attachments.svelte.ts';
