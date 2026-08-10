import { SortableList, SORTABLE_KEY_ATTR, type SortableOptions, type SortableRow } from '@neodrag/core/sortable';
import type { Room } from '@neodrag/core/collab';
import { useCallback, useEffect, useRef } from 'react';
import type { RefCallback } from './_internal.ts';
import { useRoomBinding } from './_room-context.ts';

/**
 * Sortable hook. Put `ref` on the container and spread `{...row(item.id)}` on each item instead of
 * hand-writing `data-neodrag-sortable-key`. `row(key)` returns both React's `key` and the attribute,
 * so the one spread keys the list element AND registers the row. Pass the latest `items` each render.
 *
 * **Collab:** pass an `id` (and a `room`, or mount a `<RoomProvider>`) and reorders sync live.
 */
export function useSortable<T = unknown>(options: SortableOptions<T> & { room?: Room }): {
	ref: RefCallback;
	row: (key: string) => SortableRow & { key: string };
} {
	const instance = useRef<SortableList<T> | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const { join, leave } = useRoomBinding(options.room);

	const ref = useCallback<RefCallback>(
		(node) => {
			leave();
			instance.current?.destroy();
			if (node) {
				instance.current = new SortableList(node, opts.current);
				join(instance.current, opts.current.id);
			} else {
				instance.current = null;
			}
		},
		[join, leave],
	);

	useEffect(() => {
		instance.current?.update(opts.current);
	});

	return { ref, row: (key) => ({ key, [SORTABLE_KEY_ATTR]: key }) as SortableRow & { key: string } };
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
