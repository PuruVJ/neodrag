import { render } from 'solid-js/web';
import { describe, expect, test } from 'vitest';
import { Draggable, createDraggable, createDroppable, createResizable } from '../src/index.ts';

describe('@neodrag/solid v3 API', () => {
	test('main entry re-exports the v3 surface', () => {
		expect(typeof createDraggable).toBe('function');
		expect(typeof createDroppable).toBe('function');
		expect(typeof createResizable).toBe('function');
		expect(typeof Draggable).toBe('function');
	});

	test('createDraggable attaches a Draggable instance to the node', async () => {
		function Box() {
			const { ref, isDragging } = createDraggable();
			(globalThis as { __isDragging?: () => boolean }).__isDragging = isDragging;
			return (
				<div
					ref={ref}
					data-testid="draggable"
					style={{ width: '100px', height: '100px', background: 'cyan' }}
				/>
			);
		}

		const host = document.createElement('div');
		document.body.appendChild(host);
		const dispose = render(() => <Box />, host);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(el).toBeTruthy();
		expect((globalThis as { __isDragging?: () => boolean }).__isDragging?.()).toBe(false);

		dispose();
		host.remove();
	});

	test('createResizable returns a ref and constructs without throwing', async () => {
		function Box() {
			const { ref } = createResizable();
			return <div ref={ref} data-testid="resizable" style={{ width: '100px', height: '100px' }} />;
		}

		const host = document.createElement('div');
		document.body.appendChild(host);
		const dispose = render(() => <Box />, host);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		expect(host.querySelector('[data-testid="resizable"]')).toBeTruthy();

		dispose();
		host.remove();
	});
});
