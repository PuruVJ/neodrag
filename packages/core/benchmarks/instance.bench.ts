/**
 * @vitest-environment jsdom
 */
import { bench, describe } from 'vitest';
import { DragInstance } from '../src/drag-instance.ts';

describe('DragInstance micro', () => {
	const node = document.createElement('div');

	bench(
		'construct',
		() => {
			new DragInstance(node);
		},
		{ iterations: 5000 },
	);

	bench(
		'syncCoords',
		() => {
			const inst = new DragInstance(node);
			inst.deltaX = 12;
			inst.deltaY = -4;
			inst.proposedX = 12;
			inst.proposedY = -4;
			inst.offsetX = 100;
			inst.offsetY = 200;
			inst.syncCoords();
			void inst.delta.x;
			void inst.proposed.x;
			void inst.offset.y;
		},
		{ iterations: 10000 },
	);

	bench(
		'propose + syncCoords',
		() => {
			const inst = new DragInstance(node);
			inst.propose(3, 7);
		},
		{ iterations: 10000 },
	);
});
