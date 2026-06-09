import { describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import type { Capability, ResolvedTarget } from '../../src/types.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';

function drive(dnd: Interactions, x: number, y: number, phase: 'start' | 'move' | 'end') {
	const input = programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1 });
	if (phase === 'start') dnd.host.onInteractionStart(input);
	else if (phase === 'move') dnd.host.onInteractionMove(input);
	else dnd.host.onInteractionEnd(input);
}

function stub(calls: string[], opts: Partial<Capability> = {}): Capability {
	const node = {} as HTMLElement;
	return {
		key: Symbol('stub'),
		name: 'stub',
		resolve: () => ({ node }) as ResolvedTarget,
		start: () => calls.push('start'),
		move: () => calls.push('move'),
		end: (_s, reason) => calls.push(`end:${reason}`),
		...opts,
	};
}

describe('createDnd — engine core', () => {
	it('routes the full interaction lifecycle to the claiming capability', () => {
		const calls: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		dnd.use(stub(calls));

		drive(dnd, 0, 0, 'start');
		drive(dnd, 5, 5, 'move');
		drive(dnd, 9, 9, 'move');
		drive(dnd, 9, 9, 'end');

		expect(calls).toEqual(['start', 'move', 'move', 'end:no-target']);
	});

	it('honours shouldStart as a threshold gate (no start until it passes)', () => {
		const calls: string[] = [];
		let pass = false;
		const dnd = new Interactions({ defaultSensors: false });
		dnd.use(stub(calls, { shouldStart: () => pass }));

		drive(dnd, 0, 0, 'start');
		drive(dnd, 2, 2, 'move'); // gate closed → nothing
		expect(calls).toEqual([]);
		pass = true;
		drive(dnd, 8, 8, 'move'); // gate opens → start + move
		drive(dnd, 9, 9, 'end');
		expect(calls).toEqual(['start', 'move', 'end:no-target']);
	});

	it('does not fire end() when the interaction never started (sub-threshold tap)', () => {
		const calls: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		dnd.use(stub(calls, { shouldStart: () => false }));

		drive(dnd, 0, 0, 'start');
		drive(dnd, 1, 1, 'move');
		drive(dnd, 1, 1, 'end');

		expect(calls).toEqual([]);
		expect(dnd.session).toBeNull();
	});

	it('routes by priority — higher priority claims the pointer first', () => {
		const order: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const low: Capability = {
			...stub([]),
			name: 'low',
			priority: 0,
			resolve: () => {
				order.push('low.resolve');
				return { node: {} as HTMLElement };
			},
		};
		const high: Capability = {
			...stub([]),
			name: 'high',
			priority: 10,
			resolve: () => {
				order.push('high.resolve');
				return { node: {} as HTMLElement };
			},
		};
		dnd.use(low, high);
		drive(dnd, 0, 0, 'start');
		// high priority is asked first and claims it; low is never consulted
		expect(order).toEqual(['high.resolve']);
		expect(dnd.session?.capability.name).toBe('high');
	});

	it('lets a capability end its own interaction via session.end()', () => {
		const calls: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		dnd.use(
			stub(calls, {
				move: (s) => {
					calls.push('move');
					s.end('cancel');
				},
			}),
		);
		drive(dnd, 0, 0, 'start');
		drive(dnd, 5, 5, 'move');
		expect(calls).toEqual(['start', 'move', 'end:cancel']);
		expect(dnd.session).toBeNull();
	});
});
