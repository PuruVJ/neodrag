import type { DropPluginList } from '@neodrag/core';
import { computed, onScopeDispose, shallowRef, watchEffect, type ComputedRef, type ShallowRef } from 'vue';
import { toTargetBind, type NeodragTargetBind } from './attachments.ts';
import { Droppable } from './droppable.ts';

export type UseDroppableReturn = {
	droppable: ShallowRef<Droppable>;
	bind: ComputedRef<NeodragTargetBind>;
};

function resolveDroppable(
	input: ConstructorParameters<typeof Droppable>[0] | DropPluginList | Droppable,
): Droppable {
	if (input instanceof Droppable) return input;
	if (Array.isArray(input)) return new Droppable({ plugins: input });
	return new Droppable(input);
}

export function useDroppable(
	input: ConstructorParameters<typeof Droppable>[0] | DropPluginList | Droppable = { plugins: [] },
): UseDroppableReturn {
	const droppable = shallowRef(resolveDroppable(input));

	watchEffect(() => {
		if (droppable.value.hasReactiveSlots) droppable.value.flushReactive();
	});

	onScopeDispose(() => droppable.value.destroy());

	const bind = computed(() => toTargetBind(droppable.value.zone));

	return { droppable, bind };
}
