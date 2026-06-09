import { describe, expect, it } from 'vitest';
import {
	anchorFor,
	resolveInsertIndex,
	ReconcileEngine,
} from '../../src/collab/index.ts';
import { applyMove, type MoveOp, type SortablePresence } from '../../src/sortable/sortable.ts';

const presence = (dragKey: string, fromIndex: number, toIndex: number): SortablePresence => ({
	dragKey,
	fromIndex,
	toIndex,
});

describe('reconcile — anchor algebra', () => {
	it('anchorFor / resolveInsertIndex are inverse of applyMove placement', () => {
		const order = ['a', 'b', 'c', 'd'];
		for (let to = 0; to < order.length; to++) {
			const anchor = anchorFor(order, 'a', to);
			const idx = resolveInsertIndex(order, anchor);
			expect(idx).toBe(to);
			// And it agrees with applyMove's resulting placement.
			const op: MoveOp = { itemId: anchor.itemId, afterId: anchor.afterId };
			const next = applyMove(order, op);
			expect(next.indexOf('a')).toBe(to);
		}
	});

	it('front insert resolves to index 0 with null anchor', () => {
		const anchor = anchorFor(['a', 'b', 'c'], 'c', 0);
		expect(anchor.afterId).toBe(null);
		expect(resolveInsertIndex(['a', 'b', 'c'], anchor)).toBe(0);
	});

	it('append falls back when anchor key is gone', () => {
		// anchor after 'b', but 'b' removed from order → append
		expect(resolveInsertIndex(['a', 'c'], { itemId: 'x', afterId: 'b' })).toBe(2);
	});
});

describe('ReconcileEngine — local lifecycle', () => {
	it('tracks an in-flight drag as a stable anchor', () => {
		const eng = new ReconcileEngine(['a', 'b', 'c']);
		expect(eng.isDragging).toBe(false);
		const anchor = eng.beginLocal(presence('a', 0, 2));
		expect(eng.isDragging).toBe(true);
		// a moved to index 2 → lands after 'c'
		expect(anchor).toEqual({ itemId: 'a', afterId: 'c' });
		eng.endLocal({ itemId: 'a', afterId: 'c' });
		expect(eng.isDragging).toBe(false);
		expect(eng.order).toEqual(['b', 'c', 'a']);
	});

	it('updateLocal re-derives the index as the pointer moves', () => {
		const eng = new ReconcileEngine(['a', 'b', 'c']);
		eng.beginLocal(presence('b', 1, 1));
		expect(eng.updateLocal(presence('b', 1, 0))).toBe(0);
		expect(eng.inflight).toEqual({ itemId: 'b', afterId: null });
		expect(eng.updateLocal(presence('b', 1, 2))).toBe(2);
		expect(eng.inflight).toEqual({ itemId: 'b', afterId: 'c' });
	});
});

describe('ReconcileEngine — MID-DRAG REBASE', () => {
	it('remote insert above the ghost shifts its absolute index but keeps the anchor', () => {
		// local: dragging 'a' to index 2 of [a,b,c,d]. Removing 'a' gives [b,c,d]; landing at
		// index 2 means immediately after 'c'.
		const eng = new ReconcileEngine(['a', 'b', 'c', 'd']);
		const anchor = eng.beginLocal(presence('a', 0, 2));
		expect(anchor).toEqual({ itemId: 'a', afterId: 'c' });
		const baseIdx = resolveInsertIndex(eng.order, anchor);

		// remote peer moves 'd' to the front → order becomes [d,a,b,c]
		const remote: MoveOp = { itemId: 'd', afterId: null };
		const result = eng.applyRemote(remote);

		// canonical order folded in the remote op
		expect(result.order).toEqual(['d', 'a', 'b', 'c']);
		// the ghost still lands after 'c' (its anchor is stable)
		expect(result.inflight).toEqual({ itemId: 'a', afterId: 'c' });
		// but its absolute insert index shifted because 'd' jumped ahead of it
		const withoutA = result.order.filter((k) => k !== 'a');
		expect(result.insertIndex).toBe(withoutA.indexOf('c') + 1);
		expect(result.insertIndex).not.toBe(baseIdx);
		expect(result.rebased).toBe(true);
		// drag is NOT cancelled
		expect(eng.isDragging).toBe(true);
	});

	it('remote op below the ghost does not shift its index (no rebase)', () => {
		const eng = new ReconcileEngine(['a', 'b', 'c', 'd']);
		// dragging 'a' to index 1 → anchored after 'b'
		eng.beginLocal(presence('a', 0, 1));
		expect(eng.inflight).toEqual({ itemId: 'a', afterId: 'b' });
		const before = resolveInsertIndex(eng.order, eng.inflight!);

		// remote moves 'c' below to after 'd' — entirely below the ghost's anchor region.
		const result = eng.applyRemote({ itemId: 'c', afterId: 'd' });
		expect(result.order).toEqual(['a', 'b', 'd', 'c']);
		expect(result.insertIndex).toBe(before);
		expect(result.rebased).toBe(false);
		expect(eng.isDragging).toBe(true);
	});

	it('rebase survives the anchor key itself being moved remotely', () => {
		const eng = new ReconcileEngine(['a', 'b', 'c', 'd']);
		// dragging 'a' to index 2 → anchored after 'c'
		eng.beginLocal(presence('a', 0, 2));
		expect(eng.inflight).toEqual({ itemId: 'a', afterId: 'c' });
		// remote moves our anchor 'c'... actually move 'b' after 'd' (relocates a neighbour)
		const result = eng.applyRemote({ itemId: 'b', afterId: 'd' });
		// applyMove keeps 'a' where it is, moves 'b' after 'd'
		expect(result.order).toEqual(['a', 'c', 'd', 'b']);
		// anchor still references 'c' (stable) — ghost lands right after it
		expect(result.inflight).toEqual({ itemId: 'a', afterId: 'c' });
		const without = result.order.filter((k) => k !== 'a');
		expect(result.insertIndex).toBe(without.indexOf('c') + 1);
		expect(eng.isDragging).toBe(true);
	});

	it('remote op with no drag in flight just folds into order', () => {
		const eng = new ReconcileEngine(['a', 'b', 'c']);
		const result = eng.applyRemote({ itemId: 'c', afterId: null });
		expect(result.order).toEqual(['c', 'a', 'b']);
		expect(result.inflight).toBe(null);
		expect(result.rebased).toBe(false);
	});

	it('two peers converge after a concurrent local commit + remote rebase', () => {
		// Peer A: canonical [a,b,c]. Local drag of 'a' to end. Remote op moves 'c' to front
		// arrives mid-drag, then A commits.
		const a = new ReconcileEngine(['a', 'b', 'c']);
		a.beginLocal(presence('a', 0, 2)); // a → after c
		a.applyRemote({ itemId: 'c', afterId: null }); // remote: c to front → [c,a,b]
		// A's ghost anchor was "after c" (index 2 in [a,b,c] removing a = after c)
		expect(a.inflight).toEqual({ itemId: 'a', afterId: 'c' });
		// commit the rebased intent
		const commit: MoveOp = { itemId: a.inflight!.itemId, afterId: a.inflight!.afterId };
		a.endLocal(commit);
		// A final order
		const finalA = a.order;

		// Peer B: starts [a,b,c]. Receives c-to-front, then A's commit.
		const b = new ReconcileEngine(['a', 'b', 'c']);
		b.applyRemote({ itemId: 'c', afterId: null });
		b.applyRemote(commit);
		expect(b.order).toEqual(finalA);
		expect(finalA).toEqual(['c', 'a', 'b']);
	});
});
