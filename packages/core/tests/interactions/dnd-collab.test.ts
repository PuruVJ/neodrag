/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { bindCollab, MemoryCollab } from '../../src/collab/index.ts';
import { Interactions } from '../../src/engine.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';
import { Sortable, type MoveOp } from '../../src/sortable/sortable.ts';

function input(target: HTMLElement, phase: 'start' | 'move' | 'end', x: number, y: number) {
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target });
}

function makeList() {
	const container = document.createElement('ul');
	const nodes: HTMLElement[] = [];
	for (let i = 0; i < 3; i++) {
		const li = document.createElement('li');
		li.setAttribute('data-sortable-key', String(i));
		container.appendChild(li);
		li.getBoundingClientRect = () =>
			({
				left: 0,
				top: i * 50,
				right: 100,
				bottom: i * 50 + 50,
				width: 100,
				height: 50,
				x: 0,
				y: i * 50,
				toJSON() {},
			}) as DOMRect;
		nodes.push(li);
	}
	document.body.appendChild(container);
	return { container, nodes };
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('@neodrag/collab — two-peer convergence', () => {
	it('a reorder on peer A reconciles to peer B via anchor ops', () => {
		const itemsA = [{ id: '0' }, { id: '1' }, { id: '2' }];
		const itemsB = [{ id: '0' }, { id: '1' }, { id: '2' }];
		let resultB: { next: { id: string }[]; op: MoveOp } | null = null;

		const dndA = new Interactions({ defaultSensors: false });
		const sortA = new Sortable();
		dndA.use(sortA);
		const a = makeList();
		const handleA = sortA.bind(a.container, { items: itemsA, onReorder: () => {} });

		const dndB = new Interactions({ defaultSensors: false });
		const sortB = new Sortable();
		dndB.use(sortB);
		const b = makeList();
		const handleB = sortB.bind(b.container, {
			items: itemsB,
			
			onReorder: (next, op) => (resultB = { next, op }),
		});

		const provA = new MemoryCollab();
		const provB = new MemoryCollab();
		provA.connect(provB);
		bindCollab(handleA, provA);
		bindCollab(handleB, provB);

		// reorder on A: drag item 0 past item 1's midpoint
		dndA.host.onInteractionStart(input(a.nodes[0], 'start', 10, 25));
		dndA.host.onInteractionMove(input(a.nodes[0], 'move', 10, 80));
		dndA.host.onInteractionEnd(input(a.nodes[0], 'end', 10, 80));

		// B received the op and reconciled
		expect(resultB).not.toBeNull();
		expect(resultB!.op).toEqual({ itemId: '0', afterId: '1' });
		expect(resultB!.next.map((x) => x.id)).toEqual(['1', '0', '2']);
	});
});
