/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MINIMAL_DRAG_PLUGINS, Neodrag, numberStub } from '../../src/index.ts';
import { pointerToInput } from '../../src/interaction-input.ts';
import { ControlFrom, controls, grid } from '../../src/plugins.ts';

describe('grid plugin', () => {
	it('skips X snapping when step is 0 but still snaps Y', () => {
		const plugin = grid([0, 10]);
		const ctx = {
			proposed: { x: 7, y: 7 },
			rootNode: document.createElement('div'),
			length: numberStub,
		} as Parameters<NonNullable<typeof plugin.drag>>[0];
		const patch = plugin.drag!(ctx, undefined as never, undefined as never);
		expect(patch).toEqual({ y: 10 });
	});
});

function patchPointerCapture() {
	const proto = HTMLElement.prototype;
	const prev = {
		set: proto.setPointerCapture,
		release: proto.releasePointerCapture,
		has: proto.hasPointerCapture,
	};
	proto.setPointerCapture = function () {};
	proto.releasePointerCapture = function () {};
	proto.hasPointerCapture = () => false;
	return () => {
		proto.setPointerCapture = prev.set;
		proto.releasePointerCapture = prev.release;
		proto.hasPointerCapture = prev.has;
	};
}

function pointer(
	target: EventTarget,
	type: string,
	x: number,
	y: number,
	extra: PointerEventInit = {},
) {
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			pointerId: 1,
			pointerType: 'mouse',
			isPrimary: true,
			clientX: x,
			clientY: y,
			buttons: type === 'pointerup' ? 0 : 1,
			...extra,
		}),
	);
}

function parseTranslate(el: HTMLElement) {
	const t = getComputedStyle(el).translate;
	if (!t || t === 'none') return { x: 0, y: 0 };
	const parts = t.split(' ');
	return { x: Number.parseFloat(parts[0]!), y: Number.parseFloat(parts[1]!) };
}

describe('controls allow handle moves root', () => {
	let restoreCapture: (() => void) | undefined;

	beforeEach(() => {
		restoreCapture = patchPointerCapture();
	});

	afterEach(() => {
		restoreCapture?.();
		document.body.replaceChildren();
	});

	it('dragging from allow zone translates the attached root, not only the handle', () => {
		const root = document.createElement('div');
		root.style.cssText =
			'position:fixed;left:100px;top:200px;width:320px;height:48px;touch-action:none';
		const handle = document.createElement('div');
		handle.className = 'handle';
		handle.style.cssText =
			'position:absolute;right:8px;bottom:4px;width:48px;height:40px;touch-action:none';
		root.appendChild(handle);
		document.body.appendChild(root);

		root.getBoundingClientRect = () => new DOMRect(100, 200, 320, 48);
		handle.getBoundingClientRect = () => new DOMRect(372, 208, 48, 40);

		const engine = new Neodrag({ plugins: MINIMAL_DRAG_PLUGINS, dev: false });
		engine.draggable(
			root,
			[
				controls(
					{ allow: ControlFrom.selector('.handle') },
					(ctx) => ctx.hook === 'init' || ctx.hook === 'start',
				),
			],
			{ threshold: null },
		);

		const downX = 396;
		const downY = 228;

		pointer(handle, 'pointerdown', downX, downY);
		for (let i = 1; i <= 6; i++) {
			pointer(document.documentElement, 'pointermove', downX + i * 12, downY + i * 8);
		}
		pointer(document.documentElement, 'pointerup', downX + 72, downY + 48);

		const rootT = parseTranslate(root);
		const handleT = parseTranslate(handle);

		expect(Math.hypot(rootT.x, rootT.y)).toBeGreaterThan(20);
		expect(Math.hypot(handleT.x, handleT.y)).toBeLessThan(1);
	});
});

describe('controls priority', () => {
	it('prefers block zones when priority is block and areas tie', () => {
		const plugin = controls({ priority: 'block' });
		const state = plugin.init!({
			rootNode: document.createElement('div'),
		} as Parameters<NonNullable<typeof plugin.init>>[0]);
		state.allow = [
			{
				element: document.createElement('div'),
				area: 100,
				top: 0,
				left: 0,
				right: 100,
				bottom: 100,
			},
		];
		state.block = [
			{
				element: document.createElement('div'),
				area: 100,
				top: 0,
				left: 0,
				right: 100,
				bottom: 100,
			},
		];

		const input = pointerToInput(
			new PointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
			'start',
		);
		const ctx = {
			cachedRootNodeRect: new DOMRect(0, 0, 200, 200),
			session: { setVisual: () => {} },
		} as Parameters<NonNullable<typeof plugin.start>>[0];

		const out = plugin.start!(ctx, state, input);
		expect(out).toBe(false);
	});
});
