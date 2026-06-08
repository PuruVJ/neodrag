import { collisionPriority, collisionStrategy, highlight, accepts, onDrop } from '../plugins.ts';
import type { DropPlugin } from '../types.ts';
import {
	applyGroupedSortableTransfer,
	Sortable,
	type SortableOptions,
	type SortableTransferMeta,
} from '../sortable/index.ts';

export function presetKanbanColumn<T>(options: SortableOptions<T> & {
	shellAccept?: (data: unknown) => boolean;
	onShellDrop?: (data: unknown) => void;
	shellPriority?: number;
}): {
	shellPlugins: DropPlugin[];
	listPlugins: DropPlugin[];
	item: (id: string) => import('../types.ts').DragPlugin[];
} {
	const sort = new Sortable(options);
	const shell: DropPlugin[] = [
		collisionPriority(options.shellPriority ?? 0),
		highlight({ overClass: 'drop-over' }),
	];
	if (options.shellAccept) shell.push(accepts(options.shellAccept));
	if (options.onShellDrop) shell.push(onDrop(options.onShellDrop));

	const list: DropPlugin[] = [
		collisionPriority(5),
		collisionStrategy('closestCenter'),
		...sort.container(),
	];

	return {
		shellPlugins: shell,
		listPlugins: list,
		item: sort.item,
	};
}

export function createKanbanTransfer<T extends { id: string }, C extends string>(options: {
	column: C;
	columnOf: (row: T) => C;
	withColumn: (row: T, column: C) => T;
	getAll: () => readonly T[];
	setAll: (next: T[]) => void;
}): (item: T, meta: SortableTransferMeta) => void {
	return (item, meta) => {
		options.setAll(
			applyGroupedSortableTransfer(options.getAll(), item, {
				toIndex: meta.toIndex,
				column: options.column,
				columnOf: options.columnOf,
				withColumn: options.withColumn,
			}),
		);
	};
}
