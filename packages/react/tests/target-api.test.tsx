import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, test } from 'vitest';
import { axis, position } from '@neodrag/core/plugins';
import { DRAG_MARKUP_STATE } from '@neodrag/core/internal';
import { NEODRAG_ATTACH_KEY } from '../src/attachments.ts';
import { Draggable } from '../src/draggable.ts';
import { useDraggable, useDraggableBinding } from '../src/index.ts';

function translateStyle(el: HTMLElement) {
	return getComputedStyle(el).translate;
}

describe('@neodrag/react target API', () => {
	test('Draggable target is stable and markup-only keys', () => {
		const drag = new Draggable({ plugins: [] });
		expect(drag.target).toBe(drag.target);
		expect(drag.isDragging).toBe(false);
		expect(Object.hasOwn(drag.target, 'isDragging')).toBe(false);
		expect(drag.target.draggable).toBe('false');
		expect(drag.target[DRAG_MARKUP_STATE]).toBe('idle');
		expect(drag.target[NEODRAG_ATTACH_KEY]).toBeTypeOf('function');
	});

	test('useDraggable(options) spread attaches and reactive position updates', async () => {
		let setCoords: (p: { x: number; y: number }) => void = () => {};

		const host = document.createElement('div');
		document.body.appendChild(host);
		const root = createRoot(host);

		function ReactiveBox({ x, y }: { x: number; y: number }) {
			const pos = { x, y };
			const { spread } = useDraggable({
				plugins: [axis('x'), () => position({ current: pos })],
			});
			return (
				<div
					{...spread}
					data-testid="draggable"
					style={{ width: 100, height: 100, background: 'cyan' }}
				/>
			);
		}

		function App() {
			const [coords, set] = useState({ x: 8, y: 12 });
			setCoords = set;
			return <ReactiveBox {...coords} />;
		}

		root.render(<App />);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await new Promise((r) => setTimeout(r, 16));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(translateStyle(el)).toContain('8');

		setCoords({ x: 22, y: 33 });
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await new Promise((r) => setTimeout(r, 0));

		expect(translateStyle(el)).toContain('22');

		root.unmount();
		host.remove();
	});

	test('useDraggableBinding reflects isDragging from markup', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const root = createRoot(host);

		function Box() {
			const drag = useState(() => new Draggable({ plugins: [] }))[0];
			const { spread, isDragging } = useDraggableBinding(drag);
			return (
				<div>
					<div
						{...spread}
						data-testid="draggable"
						data-dragging={isDragging ? '1' : '0'}
						style={{ width: 100, height: 100 }}
					/>
				</div>
			);
		}

		root.render(<Box />);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(el.dataset.dragging).toBe('0');

		root.unmount();
		host.remove();
	});
});
