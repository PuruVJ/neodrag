import type { ResizePluginList } from '@neodrag/core';
import { computed, onScopeDispose, shallowRef, watchEffect, type ComputedRef, type ShallowRef } from 'vue';
import { toTargetBind, type NeodragTargetBind } from './attachments.ts';
import { Resizable } from './resizable-binding.ts';

export type UseResizableReturn = {
	resizable: ShallowRef<Resizable>;
	bind: ComputedRef<NeodragTargetBind>;
};

function resolveResizable(
	input: ConstructorParameters<typeof Resizable>[0] | ResizePluginList | Resizable,
): Resizable {
	if (input instanceof Resizable) return input;
	if (Array.isArray(input)) return new Resizable({ plugins: input });
	return new Resizable(input);
}

export function useResizable(
	input: ConstructorParameters<typeof Resizable>[0] | ResizePluginList | Resizable = { plugins: [] },
): UseResizableReturn {
	const resizable = shallowRef(resolveResizable(input));

	watchEffect(() => {
		if (resizable.value.hasReactiveSlots) resizable.value.flushReactive();
	});

	onScopeDispose(() => resizable.value.destroy());

	const bind = computed(() => toTargetBind(resizable.value.frame));

	return { resizable, bind };
}
