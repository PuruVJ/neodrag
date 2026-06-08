import { sortableAgentLog } from '../agent-log.ts';

export function recordFlipRects(nodes: readonly HTMLElement[]): Map<HTMLElement, DOMRect> {
	const rects = new Map<HTMLElement, DOMRect>();
	for (const node of nodes) rects.set(node, node.getBoundingClientRect());
	return rects;
}

export const FLIP_MOVE_THRESHOLD_PX = 2;

export async function playFlip(
	nodes: readonly HTMLElement[],
	before: Map<HTMLElement, DOMRect>,
	duration: number,
): Promise<void> {
	if (duration <= 0) {
		return;
	}

	const animations: Animation[] = [];
	let maxDx = 0;
	let maxDy = 0;
	const deltas: Record<string, { dx: number; dy: number }> = {};
	for (const node of nodes) {
		const prev = before.get(node);
		if (!prev) continue;
		const next = node.getBoundingClientRect();
		const dx = prev.left - next.left;
		const dy = prev.top - next.top;
		if (Math.abs(dx) < FLIP_MOVE_THRESHOLD_PX && Math.abs(dy) < FLIP_MOVE_THRESHOLD_PX) continue;
		const key = node.getAttribute('data-sortable-key') ?? node.tagName;
		deltas[key] = { dx, dy };
		maxDx = Math.max(maxDx, Math.abs(dx));
		maxDy = Math.max(maxDy, Math.abs(dy));
		node.style.transform = `translate(${dx}px, ${dy}px)`;
		const anim = node.animate(
			{ transform: [`translate(${dx}px, ${dy}px)`, 'translate(0px, 0px)'] },
			{ duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
		);
		animations.push(anim);
	}

	// #region agent log
	sortableAgentLog('B', 'visual.ts:playFlip', 'FLIP start', {
		duration,
		animCount: animations.length,
		maxDx,
		maxDy,
		deltas,
	});
	// #endregion

	if (animations.length === 0) return;

	await Promise.all(
		animations.map((animation) =>
			animation.finished.catch(() => {
				animation.cancel();
			}),
		),
	);

	for (const node of nodes) {
		for (const animation of node.getAnimations()) animation.cancel();
		node.style.translate = '';
		node.style.transform = '';
	}

}
