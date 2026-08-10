/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Drag } from '../../src/drag/drag.ts';
import { getKeyboardDragConfig, keyboardDraggable } from '../../src/sensors/keyboard.ts';
import { translate } from './_browser.ts';

function makeNode() {
	const node = document.createElement('div');
	node.tabIndex = 0;
	node.style.cssText = 'position:absolute;left:0;top:0;width:100px;height:100px';
	document.body.appendChild(node);
	return node;
}

function press(node: HTMLElement, key: string) {
	node.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('keyboardDraggable — registration helper', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('registers the node with resolved defaults', () => {
		const node = makeNode();
		const handle = keyboardDraggable(node);
		const cfg = getKeyboardDragConfig(node)!;
		expect(cfg.grabKey).toBe('Space');
		expect(cfg.step).toBe(1);
		expect(cfg.fastStep).toBe(4);
		expect(cfg.axis).toBeNull();
		expect(cfg.slowInterval).toBe(400);
		expect(cfg.speedupDelay).toBe(800);
		expect(cfg.fastInterval).toBe(50);
		handle.destroy();
	});

	it('applies provided options', () => {
		const node = makeNode();
		const handle = keyboardDraggable(node, { grabKey: 'Enter', step: 15, axis: 'x' });
		const cfg = getKeyboardDragConfig(node)!;
		expect(cfg.grabKey).toBe('Enter');
		expect(cfg.step).toBe(15);
		expect(cfg.axis).toBe('x');
		handle.destroy();
	});

	it('update() rewrites the registered config', () => {
		const node = makeNode();
		const handle = keyboardDraggable(node, { step: 5 });
		expect(getKeyboardDragConfig(node)!.step).toBe(5);
		handle.update({ step: 25, axis: 'y' });
		const cfg = getKeyboardDragConfig(node)!;
		expect(cfg.step).toBe(25);
		expect(cfg.axis).toBe('y');
		handle.destroy();
	});

	it('destroy() unregisters the node', () => {
		const node = makeNode();
		const handle = keyboardDraggable(node, { step: 5 });
		expect(getKeyboardDragConfig(node)).toBeDefined();
		handle.destroy();
		expect(getKeyboardDragConfig(node)).toBeUndefined();
	});
});

describe('keyboard drag — end to end through the Interactions engine', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	function setup(opts: Parameters<typeof keyboardDraggable>[1] = {}) {
		const dnd = new Interactions(); // default sensors → real KeyboardMoveSensor + KeyboardSensor
		const drag = new Drag();
		dnd.use(drag);
		const node = makeNode();
		drag.bind(node, { axis: opts?.axis ?? undefined });
		const handle = keyboardDraggable(node, opts);
		node.focus();
		return { dnd, drag, node, handle };
	}

	it('arrow-right moves a focused draggable after a space grab', () => {
		const { dnd, node } = setup({ step: 10 });

		press(node, 'Space'); // grab
		press(node, 'ArrowRight'); // move +10x
		press(node, 'Space'); // commit

		expect(translate(node)).toEqual({ x: 10, y: 0 });
		dnd.dispose();
	});

	it('accumulates multiple arrow presses', () => {
		const { dnd, node } = setup({ step: 10 });

		press(node, 'Space');
		press(node, 'ArrowRight');
		press(node, 'ArrowRight');
		press(node, 'ArrowDown');
		press(node, 'Space');

		expect(translate(node)).toEqual({ x: 20, y: 10 });
		dnd.dispose();
	});

	it('moves up / left into negative offsets', () => {
		const { dnd, node } = setup({ step: 8 });

		press(node, 'Space');
		press(node, 'ArrowLeft');
		press(node, 'ArrowUp');
		press(node, 'Space');

		expect(translate(node)).toEqual({ x: -8, y: -8 });
		dnd.dispose();
	});

	it('respects an x-axis lock — vertical arrows are ignored', () => {
		const { dnd, node } = setup({ step: 10, axis: 'x' });

		press(node, 'Space');
		press(node, 'ArrowDown'); // suppressed by axis lock
		press(node, 'ArrowRight'); // honored
		press(node, 'Space');

		expect(translate(node)).toEqual({ x: 10, y: 0 });
		dnd.dispose();
	});

	it('escape cancels the keyboard session and stops further movement', () => {
		const { dnd, node } = setup({ step: 5 });

		press(node, 'Space');
		press(node, 'ArrowDown'); // +5y committed live
		expect(translate(node)).toEqual({ x: 0, y: 5 });

		// Escape cancels the active interaction.
		document.documentElement.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
		);
		const after = node.style.translate;

		// A stray arrow after cancel does nothing — there is no grabbed session.
		press(node, 'ArrowRight');
		expect(node.style.translate).toBe(after);
		dnd.dispose();
	});

	it('does not move once the registration is destroyed', () => {
		const { dnd, node, handle } = setup({ step: 10 });
		handle.destroy();

		press(node, 'Space');
		press(node, 'ArrowRight');

		expect(node.style.translate === '' || node.style.translate === '0px 0px').toBe(true);
		dnd.dispose();
	});
});
