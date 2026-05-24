import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, test } from 'vitest';
import { axis, position, transform } from '@neodrag/core/plugins';
import { useDraggable } from '../src/index.ts';

function ReactiveBox({ x, y }: { x: number; y: number }) {
	const { ref } = useDraggable([axis('x'), () => position({ current: { x, y } })]);
	return (
		<div
			ref={ref}
			data-testid="draggable"
			style={{ width: 100, height: 100, background: 'cyan' }}
		/>
	);
}

function StaticBox() {
	const { ref } = useDraggable([transform]);
	return (
		<div
			ref={ref}
			data-testid="draggable"
			style={{ width: 100, height: 100, background: 'cyan' }}
		/>
	);
}

function translateStyle(el: HTMLElement) {
	return getComputedStyle(el).translate;
}

describe('@neodrag/react reactivity', () => {
	test('useDraggable ref attaches and reactive slot updates', async () => {
		let setCoords: (p: { x: number; y: number }) => void = () => {};

		const host = document.createElement('div');
		document.body.appendChild(host);
		const root = createRoot(host);

		function App() {
			const [coords, set] = useState({ x: 8, y: 12 });
			setCoords = set;
			return <ReactiveBox {...coords} />;
		}

		root.render(<App />);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await new Promise((r) => setTimeout(r, 16));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(el).toBeTruthy();
		expect(translateStyle(el)).toContain('8');
		expect(translateStyle(el)).toContain('12');

		setCoords({ x: 22, y: 33 });
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await new Promise((r) => setTimeout(r, 0));

		expect(translateStyle(el)).toContain('22');
		expect(translateStyle(el)).toContain('33');

		root.unmount();
		host.remove();
	});

	test('static slots do not reset on parent rerender', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		let setTick: (n: number) => void = () => {};
		const root = createRoot(host);

		function App() {
			const [tick, set] = useState(0);
			setTick = set;
			void tick;
			return <StaticBox />;
		}

		root.render(<App />);

		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		const before = translateStyle(el);

		setTick(1);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		expect(translateStyle(el)).toBe(before);

		root.unmount();
		host.remove();
	});
});
