import { createRoot } from 'react-dom/client';
import { describe, expect, test } from 'vitest';
import { Draggable, useDraggable, useDroppable, useResizable } from '../src/index.ts';

function Box() {
	const { ref, isDragging } = useDraggable({ axis: 'x' });
	return (
		<div
			ref={ref}
			data-testid="draggable"
			data-dragging={isDragging ? '1' : '0'}
			style={{ width: 100, height: 100, background: 'cyan' }}
		/>
	);
}

describe('@neodrag/react v3 main entry', () => {
	test('re-exports the v3 hooks and classes', () => {
		expect(typeof useDraggable).toBe('function');
		expect(typeof useDroppable).toBe('function');
		expect(typeof useResizable).toBe('function');
		expect(typeof Draggable).toBe('function');
	});

	test('Draggable class constructs and destroys against a node', () => {
		const node = document.createElement('div');
		document.body.appendChild(node);
		const drag = new Draggable(node, { axis: 'y' });
		expect(drag).toBeInstanceOf(Draggable);
		drag.update({ axis: 'both' });
		drag.destroy();
		node.remove();
	});

	test('useDraggable attaches a ref and reports isDragging', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const root = createRoot(host);

		root.render(<Box />);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await new Promise((r) => setTimeout(r, 0));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(el).toBeTruthy();
		expect(el.dataset.dragging).toBe('0');

		root.unmount();
		host.remove();
	});
});
