import { clearDragTransform } from '../apply-transform.ts';
import type { DragCtx } from '../types.ts';
import { clearIntentSession, type SortableContext } from './context.ts';
import type { SortableIntentPluginState } from './context.ts';
import { sortableChipSnapshot, sortableStory } from './agent-log.ts';
import { clearSortableVisualPreview } from './displacement/cleanup.ts';
import { flushPendingGroupDropCommit } from './group/plan.ts';
import type { SortableOptions, SortableTransition } from './types.ts';

function resolveTransition<T>(opts: SortableOptions<T>): SortableTransition | null {
	if (opts.transition === null) return null;
	if (opts.transition) return opts.transition;
	if (opts.releaseDuration != null) {
		return { duration: opts.releaseDuration, easing: 'ease' };
	}
	return null;
}

export async function runVisualDropRelease<T>(
	ctx: SortableContext<T>,
	dragKey: string,
	state: SortableIntentPluginState,
	dragCtx: DragCtx,
): Promise<void> {
	// #region agent log
	sortableStory('E', 'release.ts:runVisualDropRelease', `drop release · ${dragKey}`, () => ({
		story: `Pointer released on "${dragKey}" — beginning visual drop release: clear previews, optional transition, then tear down intent.`,
		data: { dragKey },
	}));
	// #endregion
	const mapped = ctx.nodesByKey.get(dragKey);
	const root = dragCtx.rootNode;
	const releaseNode =
		(mapped instanceof HTMLElement && mapped.isConnected && mapped) ||
		(root instanceof HTMLElement && root.isConnected && root) ||
		(mapped instanceof HTMLElement && mapped) ||
		(root instanceof HTMLElement && root) ||
		null;

	clearSortableVisualPreview(ctx, { instant: true });
	state.displacedKeys = [];

	const transition = resolveTransition(ctx.opts);
	const node = releaseNode;
	if (root instanceof HTMLElement) {
		clearDragTransform(root);
	}
	if (transition && transition.duration > 0 && node instanceof HTMLElement && node.isConnected) {
		node.style.transition = `transform ${transition.duration}ms ${transition.easing}`;
		await new Promise<void>((resolve) => {
			const done = () => {
				node.removeEventListener('transitionend', done);
				resolve();
			};
			node.addEventListener('transitionend', done);
			setTimeout(resolve, transition.duration + 32);
		});
		node.style.transition = '';
	}

	const flushed = flushPendingGroupDropCommit(dragCtx.session);

	// #region agent log
	const chip = sortableChipSnapshot(
		releaseNode instanceof HTMLElement && releaseNode.isConnected ? releaseNode : null,
	);
	const rect = chip?.rect;
	sortableStory('E', 'release.ts:runVisualDropRelease', `drop release done · ${dragKey}`, () => ({
		story: [
			`Release finished for "${dragKey}".`,
			rect && rect.w > 0 && rect.h > 0
				? `Chip settled at (${Math.round(rect.x)}, ${Math.round(rect.y)}) size ${Math.round(rect.w)}×${Math.round(rect.h)}.`
				: `WARNING: chip rect is ${rect ? `${rect.w}×${rect.h}` : 'missing'} — possible broken layout.`,
		].join(' '),
		data: {
			dragKey,
			chip,
			flushedPendingCommit: flushed,
			releaseNode: releaseNode instanceof HTMLElement ? (releaseNode === root ? 'root' : 'mapped') : 'none',
			mappedConnected: mapped instanceof HTMLElement ? mapped.isConnected : false,
			rootConnected: root instanceof HTMLElement ? root.isConnected : false,
			releaseConnected: releaseNode instanceof HTMLElement ? releaseNode.isConnected : false,
		},
	}));
	// #endregion
	clearIntentSession(ctx);
}
