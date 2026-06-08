import type { DragPluginList } from '@neodrag/core';
import { onScopeDispose, watchEffect, computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue';
import { toTargetBind, type NeodragTargetBind } from './attachments.ts';
import { Draggable, type DraggableOptions } from './draggable.ts';

export type UseDraggableReturn = {
	draggable: ShallowRef<Draggable>;
	bind: ComputedRef<NeodragTargetBind>;
	isDragging: ComputedRef<boolean>;
};

function isDragPluginList(value: unknown): value is DragPluginList {
	return Array.isArray(value);
}

function resolveDraggable(
	input: DraggableOptions | DragPluginList | Draggable,
): Draggable {
	if (input instanceof Draggable) return input;
	if (isDragPluginList(input)) return new Draggable({ plugins: input });
	return new Draggable(input);
}

function useDraggableBinding(drag: ShallowRef<Draggable>): UseDraggableReturn {
	watchEffect(() => {
		if (drag.value.hasReactiveSlots) drag.value.flushReactive();
	});

	onScopeDispose(() => drag.value.destroy());

	const bind = computed(() => toTargetBind(drag.value.target));
	const isDragging = computed(() => drag.value.isDragging);

	return { draggable: drag, bind, isDragging };
}

export function useDraggable(options: DraggableOptions): UseDraggableReturn;
export function useDraggable(plugins: DragPluginList): UseDraggableReturn;
export function useDraggable(instance: Draggable): UseDraggableReturn;
export function useDraggable(
	input: DraggableOptions | DragPluginList | Draggable = { plugins: [] },
): UseDraggableReturn {
	const drag = shallowRef(resolveDraggable(input));
	return useDraggableBinding(drag);
}
