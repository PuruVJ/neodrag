import { defineDropPlugin, type DropPlugin } from '../types.ts';
import { SORTABLE_DROP_KEY } from '../sortable-keys.ts';
import { ContainerDropState, sortableDrop } from './commit.ts';
import type { SortableContext } from './context.ts';
import { SortableDragData } from './session-data.ts';
import { isForeignDrag, refreshSortableVisual, resolveStrategy } from './intent.ts';
import { sortableAgentLog } from './agent-log.ts';
import { computeIndex } from './mids.ts';
import type { SortableOptions } from './types.ts';

export function createSortableContainerDrop<T>(
	ctx: SortableContext<T>,
	opts: SortableOptions<T>,
): DropPlugin {
	return defineDropPlugin(() => ({
		key: SORTABLE_DROP_KEY,
		phase: 'resolve',

		init(dropCtx) {
			ctx.containerNode = dropCtx.rootNode;
			return new ContainerDropState({
				sortableId: ctx.id,
				hoverIndex: -1,
				dragKey: '',
				lastX: NaN,
				lastY: NaN,
				lastIndex: -1,
			});
		},

		destroy() {
			ctx.containerNode = null;
			ctx.clearIntent();
		},

		over(dropCtx, state, input) {
			const x = input.clientX;
			const y = input.clientY;
			if (x === state.lastX && y === state.lastY) return;

			const dragKey = SortableDragData.key(dropCtx.session.data);
			const strategy = ctx.intent?.sessionStrategy ?? resolveStrategy(opts.strategy);
			const nextIndex =
				dragKey && ctx.intent && ctx.intent.targetIndex >= 0
					? ctx.intent.targetIndex
					: computeIndex(ctx, x, y, strategy, dragKey);

			state.dragKey = dragKey;
			state.hoverIndex = nextIndex;
			state.lastIndex = nextIndex;
			state.lastX = x;
			state.lastY = y;
		},

		leave(dropCtx, state) {
			const dragKey = SortableDragData.key(dropCtx.session.data) || state.dragKey;
			if (dragKey && isForeignDrag(ctx, dropCtx.session.data)) {
				state.hoverIndex = -1;
				state.lastIndex = -1;
				return;
			}
			if (dragKey && ctx.intent) return;
			state.hoverIndex = -1;
			state.lastIndex = -1;
			if (ctx.intent) ctx.intent.previewTo = ctx.intent.dragFrom;
			if (ctx.intentVisual) {
				refreshSortableVisual(ctx, ctx.intentVisualKey ?? '', ctx.intentVisual);
			}
		},

		drop(dropCtx, state) {
			const input = dropCtx.lastInput;
			const pointerX = input?.clientX ?? dropCtx.pointer.x;
			const pointerY = input?.clientY ?? dropCtx.pointer.y;
			// #region agent log
			sortableAgentLog('A', 'container-drop.ts:drop', 'container drop', {
				dragKey: SortableDragData.key(dropCtx.session.data) || state.dragKey,
				previewTo: ctx.intent?.previewTo,
				dragFrom: ctx.intent?.dragFrom,
				pointerX,
				pointerY,
			});
			// #endregion
			const resolution = sortableDrop.resolve(ctx, opts, dropCtx, state, pointerX, pointerY);
			sortableDrop.apply(ctx, opts, resolution, dropCtx);
		},
	}))();
}
