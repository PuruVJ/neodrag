/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Drag } from '../../src/drag/drag.ts';
import { Drop, rankDrop } from '../../src/drop/drop.ts';
import { Interactions } from '../../src/engine.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';

function node(rect?: { left: number; top: number; right: number; bottom: number }): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	if (rect) {
		el.getBoundingClientRect = () =>
			({
				...rect,
				width: rect.right - rect.left,
				height: rect.bottom - rect.top,
				x: rect.left,
				y: rect.top,
				toJSON() {},
			}) as DOMRect;
	}
	return el;
}

function input(target: HTMLElement, phase: 'start' | 'move' | 'end', x: number, y: number) {
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target });
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('collision ranking (pure)', () => {
	const r = (l: number, t: number, rr: number, b: number) => ({ left: l, top: t, right: rr, bottom: b });

	it('picks closest center on a priority tie', () => {
		const a = { rect: r(0, 0, 100, 100), priority: 0, policy: 'closestCenter' as const };
		const b = { rect: r(40, 40, 140, 140), priority: 0, policy: 'closestCenter' as const };
		expect(rankDrop([a, b], 90, 90)).toBe(b);
	});

	it('higher priority wins regardless of distance', () => {
		const a = { rect: r(0, 0, 100, 100), priority: 0, policy: 'closestCenter' as const };
		const hi = { rect: r(0, 0, 10, 10), priority: 5, policy: 'pointer' as const };
		expect(rankDrop([a, hi], 90, 90)).toBe(hi);
	});
});

describe('Drop capability (DOM, observing drag)', () => {
	it('fires enter/over/leave/drop as the pointer crosses a zone', () => {
		const dragNode = node();
		const zone = node({ left: 100, top: 100, right: 200, bottom: 200 });
		const log: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		const drop = new Drop();
		dnd.use(drag, drop);
		drag.bind(dragNode, {});
		drop.bind(zone, {
			onEnter: () => log.push('enter'),
			onOver: () => log.push('over'),
			onLeave: () => log.push('leave'),
			onDrop: () => log.push('drop'),
		});

		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		dnd.host.onInteractionMove(input(dragNode, 'move', 10, 10)); // outside
		expect(log).toEqual([]);
		dnd.host.onInteractionMove(input(dragNode, 'move', 150, 150)); // enter
		expect(log).toEqual(['enter', 'over']);
		expect(zone.hasAttribute('data-neodrag-over')).toBe(true);
		dnd.host.onInteractionMove(input(dragNode, 'move', 160, 160)); // over
		dnd.host.onInteractionEnd(input(dragNode, 'end', 160, 160)); // drop
		expect(log).toEqual(['enter', 'over', 'over', 'drop', 'leave']);
		expect(zone.hasAttribute('data-neodrag-over')).toBe(false);
	});

	it('accepts() filters which drags a zone reacts to', () => {
		const dragNode = node();
		const zone = node({ left: 0, top: 0, right: 100, bottom: 100 });
		const log: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		const drop = new Drop();
		dnd.use(drag, drop);
		drag.bind(dragNode, { dragData: { type: 'file' } });
		drop.bind(zone, {
			accepts: ({ data }) => (data as { type?: string } | undefined)?.type === 'card',
			onEnter: () => log.push('enter'),
			onDrop: () => log.push('drop'),
		});

		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		dnd.host.onInteractionMove(input(dragNode, 'move', 50, 50));
		dnd.host.onInteractionEnd(input(dragNode, 'end', 50, 50));
		expect(log).toEqual([]);
	});
});
