import { SortableList, SORTABLE_KEY_ATTR, type SortableOptions, type SortableRow } from '@neodrag/core/sortable';
import type { Room } from '@neodrag/core/collab';
import { createEffect, onCleanup } from 'solid-js';
import type { Ref } from './_internal.ts';
import { useRoomBinding } from './_room-context.ts';

/**
 * Sortable primitive. Put `ref` on the container and spread `{...row(item.id)}` on each item instead
 * of hand-writing `data-neodrag-sortable-key`. Pass `items` (and any option) as a getter to keep it live.
 *
 * **Collab:** pass an `id` (and a `room`, or mount a `<RoomProvider>`) and reorders sync live.
 */
export function createSortable<T = unknown>(options: SortableOptions<T> & { room?: Room }): {
	ref: Ref;
	row: (key: string) => SortableRow;
} {
	let inst: SortableList<T> | null = null;
	const { join, leave } = useRoomBinding(options.room);
	const ref: Ref = (node) => {
		leave();
		inst?.destroy();
		inst = new SortableList(node, { ...options });
		join(inst, options.id);
		onCleanup(() => {
			leave();
			inst?.destroy();
			inst = null;
		});
	};
	createEffect(() => {
		const next = { ...options };
		inst?.update(next);
	});
	return { ref, row: (key) => ({ [SORTABLE_KEY_ATTR]: key }) as SortableRow };
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
