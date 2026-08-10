/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { programmaticToInput } from '../../src/interaction-input.ts';
import { Drag, type DragEventData } from '../../src/drag/drag.ts';
import { autoScroll } from '../../src/extend/auto-scroll.ts';
import { scrollLock } from '../../src/extend/scroll-lock.ts';
import { ghost } from '../../src/extend/ghost.ts';
import {
	ControlFrom,
	controlAllowsStart,
	resolveControl,
	type ControlZone,
} from '../../src/drag/controls.ts';

function input(clientX: number, clientY: number) {
	return programmaticToInput({ phase: 'move', clientX, clientY });
}

function ctx(node: HTMLElement, clientX: number, clientY: number, offset = { x: 0, y: 0 }): DragEventData {
	return { offset, node, input: input(clientX, clientY) };
}

describe('autoScroll (use:[] seam)', () => {
	let scrollBy: ReturnType<typeof vi.fn>;
	let container: HTMLElement;

	beforeEach(() => {
		scrollBy = vi.fn();
		container = document.createElement('div');
		container.scrollBy = scrollBy as unknown as HTMLElement['scrollBy'];
		// A 500x500 box at the viewport origin.
		container.getBoundingClientRect = () =>
			({ top: 0, left: 0, right: 500, bottom: 500, width: 500, height: 500 }) as DOMRect;
		document.body.appendChild(container);
	});

	afterEach(() => {
		container.remove();
		vi.restoreAllMocks();
	});

	it('scrolls down + right near the bottom-right edge', () => {
		const p = autoScroll({ container, margin: 48, maxSpeed: 24 });
		// 490,490 is within 48px of right (500) and bottom (500).
		p.onMove!(ctx(container, 490, 490));
		expect(scrollBy).toHaveBeenCalledTimes(1);
		expect(scrollBy).toHaveBeenCalledWith(24, 24);
	});

	it('scrolls up + left near the top-left edge', () => {
		const p = autoScroll({ container, margin: 48, maxSpeed: 24 });
		p.onMove!(ctx(container, 10, 10));
		expect(scrollBy).toHaveBeenCalledWith(-24, -24);
	});

	it('does not scroll when the pointer is in the safe interior', () => {
		const p = autoScroll({ container, margin: 48, maxSpeed: 24 });
		p.onMove!(ctx(container, 250, 250));
		expect(scrollBy).not.toHaveBeenCalled();
	});

	it('scrolls a single axis when only one edge is near', () => {
		const p = autoScroll({ container, margin: 48, maxSpeed: 24 });
		p.onMove!(ctx(container, 250, 490)); // only bottom
		expect(scrollBy).toHaveBeenCalledWith(0, 24);
	});

	it('honours custom maxSpeed', () => {
		const p = autoScroll({ container, margin: 48, maxSpeed: 100 });
		p.onMove!(ctx(container, 490, 250));
		expect(scrollBy).toHaveBeenCalledWith(100, 0);
	});

	it('re-reads a lazy container getter each tick', () => {
		const p = autoScroll({ container: () => container, margin: 48, maxSpeed: 24 });
		p.onMove!(ctx(container, 490, 490));
		expect(scrollBy).toHaveBeenCalledWith(24, 24);
	});

	it('falls back to the viewport scrolling element when no container is given', () => {
		const sel = document.scrollingElement ?? document.documentElement;
		const vpScroll = vi.fn();
		const original = sel.scrollBy;
		(sel as HTMLElement).scrollBy = vpScroll as unknown as HTMLElement['scrollBy'];
		const w = window.innerWidth;
		const h = window.innerHeight;
		const p = autoScroll({ margin: 48, maxSpeed: 24 });
		p.onMove!(ctx(document.body, w - 5, h - 5));
		expect(vpScroll).toHaveBeenCalledWith(24, 24);
		(sel as HTMLElement).scrollBy = original;
	});
});

describe('scrollLock (use:[] seam)', () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => container.remove());

	it('sets overflow hidden + touch-action none + user-select none on start', () => {
		const p = scrollLock({ container });
		p.onStart!(ctx(container, 0, 0));
		expect(container.style.getPropertyValue('overflow')).toBe('hidden');
		expect(container.style.getPropertyValue('touch-action')).toBe('none');
		expect(container.style.getPropertyValue('user-select') || container.style.getPropertyValue('-webkit-user-select')).toBe('none');
	});

	it('restores the original inline styles on end', () => {
		container.style.setProperty('overflow', 'auto');
		container.style.setProperty('touch-action', 'pan-x');
		const p = scrollLock({ container });
		p.onStart!(ctx(container, 0, 0));
		expect(container.style.getPropertyValue('overflow')).toBe('hidden');
		p.onEnd!(ctx(container, 0, 0));
		expect(container.style.getPropertyValue('overflow')).toBe('auto');
		expect(container.style.getPropertyValue('touch-action')).toBe('pan-x');
		// user-select had no inline value originally → restored to empty.
		expect(container.style.getPropertyValue('user-select')).toBe('');
	});

	it('keeps the scrollbar when allowScrollbar is set (no overflow change)', () => {
		const p = scrollLock({ container, allowScrollbar: true });
		p.onStart!(ctx(container, 0, 0));
		expect(container.style.getPropertyValue('overflow')).toBe('');
		expect(container.style.getPropertyValue('touch-action')).toBe('none');
	});

	it('locks the x pan axis to pan-y and y to pan-x', () => {
		const px = scrollLock({ container, lockAxis: 'x' });
		px.onStart!(ctx(container, 0, 0));
		expect(container.style.getPropertyValue('touch-action')).toBe('pan-y');
		px.onEnd!(ctx(container, 0, 0));

		const py = scrollLock({ container, lockAxis: 'y' });
		py.onStart!(ctx(container, 0, 0));
		expect(container.style.getPropertyValue('touch-action')).toBe('pan-x');
	});

	it('defaults to documentElement when no container is given', () => {
		const p = scrollLock();
		p.onStart!(ctx(document.body, 0, 0));
		expect(document.documentElement.style.getPropertyValue('overflow')).toBe('hidden');
		p.onEnd!(ctx(document.body, 0, 0));
		expect(document.documentElement.style.getPropertyValue('overflow')).toBe('');
	});
});

describe('ghost (use:[] seam)', () => {
	let node: HTMLElement;

	beforeEach(() => {
		node = document.createElement('div');
		node.textContent = 'card';
		node.getBoundingClientRect = () =>
			({ top: 30, left: 40, right: 140, bottom: 80, width: 100, height: 50 }) as DOMRect;
		document.body.appendChild(node);
	});

	afterEach(() => {
		node.remove();
		document.querySelectorAll('[data-neodrag-ghost-host]').forEach((el) => el.remove());
		document.body.classList.remove('neodrag-ghost-active');
	});

	it('creates a positioned clone in a fixed overlay host on start', () => {
		const p = ghost();
		p.onStart!(ctx(node, 0, 0));

		const host = document.querySelector('[data-neodrag-ghost-host]') as HTMLElement;
		expect(host).toBeTruthy();
		expect(host.style.position).toBe('fixed');

		const clone = document.querySelector('.neodrag-ghost') as HTMLElement;
		expect(clone).toBeTruthy();
		expect(clone).not.toBe(node);
		expect(clone.textContent).toBe('card');
		expect(clone.style.position).toBe('fixed');
		expect(clone.style.top).toBe('30px');
		expect(clone.style.left).toBe('40px');
		expect(clone.style.width).toBe('100px');
		expect(clone.style.height).toBe('50px');
		expect(clone.style.opacity).toBe('0.5');
		expect(document.body.classList.contains('neodrag-ghost-active')).toBe(true);
	});

	it('honours custom opacity', () => {
		const p = ghost({ opacity: 0.2 });
		p.onStart!(ctx(node, 0, 0));
		const clone = document.querySelector('.neodrag-ghost') as HTMLElement;
		expect(clone.style.opacity).toBe('0.2');
	});

	it('translates the clone by the offset and pins the original on move', () => {
		const p = ghost();
		p.onStart!(ctx(node, 0, 0));
		const adjusted = p.onMove!(ctx(node, 200, 220, { x: 60, y: 90 }));
		// Original is pinned: the plugin returns a zero offset for the core to apply.
		expect(adjusted).toEqual({ x: 0, y: 0 });
		const clone = document.querySelector('.neodrag-ghost') as HTMLElement;
		expect(clone.style.translate).toBe('60px 90px');
		// Original keeps no translate.
		expect(node.style.translate).toBe('');
	});

	it('removes the clone and class on end', () => {
		const p = ghost();
		p.onStart!(ctx(node, 0, 0));
		expect(document.querySelector('.neodrag-ghost')).toBeTruthy();
		p.onEnd!(ctx(node, 0, 0));
		expect(document.querySelector('.neodrag-ghost')).toBeNull();
		expect(document.body.classList.contains('neodrag-ghost-active')).toBe(false);
	});

	it('strips neodrag bookkeeping attributes from the clone', () => {
		node.setAttribute('data-neodrag-state', 'idle');
		node.setAttribute('data-neodrag-dragging', '');
		const p = ghost();
		p.onStart!(ctx(node, 0, 0));
		const clone = document.querySelector('.neodrag-ghost') as HTMLElement;
		expect(clone.hasAttribute('data-neodrag-state')).toBe(false);
		expect(clone.hasAttribute('data-neodrag-dragging')).toBe(false);
	});
});

describe('touchAction (built-in DragOption)', () => {
	it('applies an axis-aware touch-action at bind and restores on destroy', () => {
		const node = document.createElement('div');
		const handle = new Drag().bind(node, {}); // free drag → 'none'
		expect(node.style.getPropertyValue('touch-action')).toBe('none');
		handle.destroy();
		expect(node.style.getPropertyValue('touch-action')).toBe('');
	});

	it('axis-aware default: pan-y for axis x, pan-x for axis y', () => {
		const drag = new Drag();
		const nx = document.createElement('div');
		drag.bind(nx, { axis: 'x' });
		expect(nx.style.getPropertyValue('touch-action')).toBe('pan-y');
		const ny = document.createElement('div');
		drag.bind(ny, { axis: 'y' });
		expect(ny.style.getPropertyValue('touch-action')).toBe('pan-x');
	});

	it('honours a custom value and restores a pre-existing inline touch-action on destroy', () => {
		const node = document.createElement('div');
		node.style.setProperty('touch-action', 'manipulation');
		const handle = new Drag().bind(node, { touchAction: 'pan-y' });
		expect(node.style.getPropertyValue('touch-action')).toBe('pan-y');
		handle.destroy();
		expect(node.style.getPropertyValue('touch-action')).toBe('manipulation');
	});

	it('touchAction: false leaves it untouched', () => {
		const node = document.createElement('div');
		node.style.setProperty('touch-action', 'manipulation');
		new Drag().bind(node, { touchAction: false });
		expect(node.style.getPropertyValue('touch-action')).toBe('manipulation');
	});
});

describe('controls allow/block resolution', () => {
	const zone = (left: number, top: number, right: number, bottom: number): ControlZone => ({
		element: document.createElement('div'),
		left,
		top,
		right,
		bottom,
		area: (right - left) * (bottom - top),
	});

	it('allows everything when nothing is configured', () => {
		expect(resolveControl([], [], false).isAllow).toBe(true);
	});

	it('blocks everything outside the allow set when allow is defined', () => {
		expect(resolveControl([], [], true).isAllow).toBe(false);
	});

	it('a smaller nested allow zone wins over an enclosing block zone', () => {
		const allow = [zone(10, 10, 30, 30)]; // area 400
		const block = [zone(0, 0, 100, 100)]; // area 10000, encloses allow
		expect(resolveControl(allow, block, true).isAllow).toBe(true);
	});

	it('a smaller nested block zone wins over an enclosing allow zone', () => {
		const allow = [zone(0, 0, 100, 100)];
		const block = [zone(10, 10, 30, 30)];
		expect(resolveControl(allow, block, true).isAllow).toBe(false);
	});

	it('block wins an equal-area tie when priority is block', () => {
		const allow = [zone(0, 0, 50, 50)];
		const block = [zone(0, 0, 50, 50)];
		expect(resolveControl(allow, block, true, 'block').isAllow).toBe(false);
		expect(resolveControl(allow, block, true, 'allow').isAllow).toBe(true);
	});

	it('ControlFrom.selector reads zones from the DOM relative to the root', () => {
		const root = document.createElement('div');
		root.getBoundingClientRect = () =>
			({ top: 0, left: 0, right: 200, bottom: 200, width: 200, height: 200 }) as DOMRect;
		const child = document.createElement('button');
		child.className = 'handle';
		child.getBoundingClientRect = () =>
			({ top: 10, left: 20, right: 60, bottom: 50, width: 40, height: 40 }) as DOMRect;
		root.appendChild(child);
		const zones = ControlFrom.selector('.handle')(root);
		expect(zones).toHaveLength(1);
		expect(zones[0]).toMatchObject({ left: 20, top: 10, right: 60, bottom: 50, area: 1600 });
	});

	it('controls gate allows/blocks the start point by handle zone', () => {
		const root = document.createElement('div');
		root.getBoundingClientRect = () =>
			({ top: 0, left: 0, right: 200, bottom: 200, width: 200, height: 200 }) as DOMRect;
		const handle = document.createElement('div');
		handle.className = 'h';
		handle.getBoundingClientRect = () =>
			({ top: 0, left: 0, right: 50, bottom: 50, width: 50, height: 50 }) as DOMRect;
		root.appendChild(handle);

		const cfg = { handle: ControlFrom.selector('.h') };
		// Pointer inside the handle (allow) zone → may start.
		expect(controlAllowsStart(cfg, root, 25, 25)).toBe(true);
		// Pointer outside it → blocked (handle defined but no hit).
		expect(controlAllowsStart(cfg, root, 150, 150)).toBe(false);
	});
});
