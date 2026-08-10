import { SortableList, SORTABLE_KEY_ATTR, type SortableOptions, type SortableRow } from '@neodrag/core/sortable';
import type { Room } from '@neodrag/core/collab';
import { onScopeDispose, ref, watch, watchEffect, type Ref } from 'vue';
import { useRoomBinding } from './_room-context.ts';

/**
 * Sortable composable. Bind `:ref="ref"` on the container and `v-bind="row(item.id)"` on each item
 * instead of hand-writing `data-neodrag-sortable-key`. Pass `items` (and any option) as a getter.
 *
 * **Collab:** pass an `id` (and a `room`, or call `provideRoom()` in an ancestor) and reorders sync.
 */
export function useSortable<T = unknown>(options: SortableOptions<T> & { room?: Room }): {
	ref: Ref<HTMLElement | null>;
	row: (key: string) => SortableRow;
} {
	const target = ref<HTMLElement | null>(null);
	let inst: SortableList<T> | null = null;
	const { join, leave } = useRoomBinding(options.room);

	watch(target, (node) => {
		leave();
		inst?.destroy();
		if (node) {
			inst = new SortableList(node, { ...options });
			join(inst, options.id);
		} else {
			inst = null;
		}
	});
	watchEffect(() => {
		const next = { ...options };
		inst?.update(next);
	});
	onScopeDispose(() => inst?.destroy());

	return { ref: target, row: (key) => ({ [SORTABLE_KEY_ATTR]: key }) as SortableRow };
}

export {
	SortableList,
	SORTABLE_KEY_ATTR,
	type SortableOptions,
	type SortableRow,
	type TransferOp,
	type SortAxis,
	type SortStrategy,
	type MoveOp,
	type SortableOp,
	type TransferContainer,
} from '@neodrag/core/sortable';
