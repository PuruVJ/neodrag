import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryPresence, PresenceChannel, type PresenceFrame } from '../../src/collab/index.ts';

type SortableFrame = Extract<PresenceFrame, { type: 'sortable' }>;

const frame = (peerId: string, insertIndex: number, x = 0, y = 0): SortableFrame => ({
	type: 'sortable',
	peerId,
	target: 'list',
	fromTarget: 'list',
	itemId: 'k',
	insertIndex,
	rel: { x, y },
});

/** Pull the insert index off a (sortable) frame — `null` for a null/foreign frame. */
const idx = (p: PresenceFrame | null | undefined): number | null =>
	p && p.type === 'sortable' ? p.insertIndex : null;

describe('PresenceChannel — round-trip', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('broadcasts an in-flight frame to a connected peer', () => {
		const ta = new MemoryPresence('A');
		const tb = new MemoryPresence('B');
		ta.connect(tb);
		const a = new PresenceChannel(ta);
		const b = new PresenceChannel(tb);

		const seen: Array<[string, PresenceFrame | null]> = [];
		b.onPresence((id, p) => seen.push([id, p]));

		a.broadcast(frame('A', 2, 10, 20));

		expect(seen).toHaveLength(1);
		expect(seen[0][0]).toBe('A');
		expect(seen[0][1]).toMatchObject({ peerId: 'A', insertIndex: 2, rel: { x: 10, y: 20 } });
		expect(idx(b.remotePresences().get('A'))).toBe(2);

		a.dispose();
		b.dispose();
	});

	it('a null broadcast (drag end) clears the remote ghost immediately', () => {
		const ta = new MemoryPresence('A');
		const tb = new MemoryPresence('B');
		ta.connect(tb);
		const a = new PresenceChannel(ta);
		const b = new PresenceChannel(tb);

		a.broadcast(frame('A', 1));
		expect(b.remotePresences().has('A')).toBe(true);

		a.broadcast(null);
		expect(b.remotePresences().has('A')).toBe(false);

		a.dispose();
		b.dispose();
	});

	it('throttles a flood of moves to leading + trailing edges', () => {
		const ta = new MemoryPresence('A');
		const tb = new MemoryPresence('B');
		ta.connect(tb);
		const a = new PresenceChannel(ta, 40);
		const b = new PresenceChannel(tb, 40);

		const received: number[] = [];
		b.onPresence((_id, p) => p && idx(p) !== null && received.push(idx(p)!));

		// 5 rapid frames within the throttle window.
		a.broadcast(frame('A', 0)); // leading edge — sent now
		a.broadcast(frame('A', 1)); // coalesced
		a.broadcast(frame('A', 2)); // coalesced
		a.broadcast(frame('A', 3)); // coalesced (latest wins)
		expect(received).toEqual([0]); // only the leading frame so far

		vi.advanceTimersByTime(40); // trailing edge fires with the freshest frame
		expect(received).toEqual([0, 3]);

		// After the window, the next broadcast is a fresh leading edge.
		vi.advanceTimersByTime(40);
		a.broadcast(frame('A', 9));
		expect(received).toEqual([0, 3, 9]);

		a.dispose();
		b.dispose();
	});

	it('two peers each see the other\'s presence (bidirectional)', () => {
		const ta = new MemoryPresence('A');
		const tb = new MemoryPresence('B');
		ta.connect(tb);
		const a = new PresenceChannel(ta);
		const b = new PresenceChannel(tb);

		a.broadcast(frame('A', 1));
		b.broadcast(frame('B', 2));

		expect(idx(b.remotePresences().get('A'))).toBe(1);
		expect(idx(a.remotePresences().get('B'))).toBe(2);
		// neither sees its own frame echoed
		expect(a.remotePresences().has('A')).toBe(false);
		expect(b.remotePresences().has('B')).toBe(false);

		a.dispose();
		b.dispose();
	});

	it('dispose stops delivering and clears stored presence', () => {
		const ta = new MemoryPresence('A');
		const tb = new MemoryPresence('B');
		ta.connect(tb);
		const a = new PresenceChannel(ta);
		const b = new PresenceChannel(tb);

		a.broadcast(frame('A', 1));
		expect(b.remotePresences().size).toBe(1);
		b.dispose();
		expect(b.remotePresences().size).toBe(0);

		const after: unknown[] = [];
		// a fresh subscriber on a disposed channel never fires from A's later frames
		const c = new PresenceChannel(tb);
		c.onPresence((_id, p) => after.push(p));
		a.broadcast(frame('A', 5));
		// b was disposed (unsubscribed); c is a new transport-less listener on tb so it does get it
		expect(b.remotePresences().size).toBe(0);

		a.dispose();
		c.dispose();
	});
});
