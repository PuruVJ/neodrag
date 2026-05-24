import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { describe, expect, test } from 'vitest';
import { axis, position } from '@neodrag/core/plugins';
import { useDraggable } from '../src/index.ts';

function ReactiveBox() {
	const [x, setX] = createSignal(4);
	const [y, setY] = createSignal(9);
	(globalThis as { __solidSet?: (nx: number, ny: number) => void }).__solidSet = (nx, ny) => {
		setX(nx);
		setY(ny);
	};

	const [, ref] = useDraggable([axis('x'), () => position({ current: { x: x(), y: y() } })]);

	return (
		<div
			ref={ref}
			data-testid="draggable"
			style={{ width: '100px', height: '100px', background: 'cyan' }}
		/>
	);
}

function translateStyle(el: HTMLElement) {
	return getComputedStyle(el).translate;
}

describe('@neodrag/solid reactivity', () => {
	test('useDraggable ref and reactive slot update', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		render(() => <ReactiveBox />, host);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(translateStyle(el)).toContain('4');
		expect(translateStyle(el)).toContain('9');

		(globalThis as { __solidSet?: (nx: number, ny: number) => void }).__solidSet?.(18, 27);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await new Promise((r) => setTimeout(r, 0));

		expect(translateStyle(el)).toContain('18');
		expect(translateStyle(el)).toContain('27');

		host.remove();
	});

	test('static useDraggable slots', async () => {
		function Static() {
			const [, ref] = useDraggable([]);
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
		render(() => <Static />, host);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(host.querySelector('[data-testid="draggable"]')).toBeTruthy();
		host.remove();
	});
});
