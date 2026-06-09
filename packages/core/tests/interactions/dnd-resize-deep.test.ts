/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';
import {
	clampSizeToBounds,
	Resize,
	resolveResizeBounds,
	type ResizeOptions,
} from '../../src/resize/resize.ts';
import { preserveUnits } from '../../src/resize/preserve-units.ts';

function mockRect(
	el: Element,
	rect: { left: number; top: number; right: number; bottom: number },
) {
	el.getBoundingClientRect = () =>
		({
			...rect,
			width: rect.right - rect.left,
			height: rect.bottom - rect.top,
			x: rect.left,
			y: rect.top,
			toJSON() {},
		}) as DOMRect;
}

function input(target: Element, phase: 'start' | 'move' | 'end', x: number, y: number) {
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target });
}

afterEach(() => {
	document.body.innerHTML = '';
});

function setup(options: ResizeOptions = {}, edge = 'se') {
	const box = document.createElement('div');
	const handle = document.createElement('div');
	handle.setAttribute('data-neodrag-resize-handle', edge);
	box.appendChild(handle);
	document.body.appendChild(box);
	mockRect(box, { left: 0, top: 0, right: 100, bottom: 80 }); // 100×80
	const dnd = new Interactions({ defaultSensors: false });
	const resize = new Resize();
	dnd.use(resize);
	resize.bind(box, options);
	return { box, handle, dnd };
}

describe('resolveResizeBounds', () => {
	it('resolves an explicit rect verbatim', () => {
		const node = document.createElement('div');
		const rect = { left: 0, top: 0, right: 200, bottom: 200 };
		expect(resolveResizeBounds(rect, node)).toEqual(rect);
	});

	it('resolves a thunk lazily', () => {
		const node = document.createElement('div');
		let calls = 0;
		const fn = () => {
			calls++;
			return { left: 1, top: 2, right: 3, bottom: 4 };
		};
		expect(resolveResizeBounds(fn, node)).toEqual({ left: 1, top: 2, right: 3, bottom: 4 });
		expect(calls).toBe(1);
	});

	it("resolves 'parent' to the parent rect", () => {
		const parent = document.createElement('div');
		const node = document.createElement('div');
		parent.appendChild(node);
		document.body.appendChild(parent);
		mockRect(parent, { left: 10, top: 10, right: 210, bottom: 160 });
		expect(resolveResizeBounds('parent', node)).toMatchObject({
			left: 10,
			top: 10,
			right: 210,
			bottom: 160,
		});
	});

	it("resolves 'viewport' to the window box", () => {
		const node = document.createElement('div');
		expect(resolveResizeBounds('viewport', node)).toEqual({
			left: 0,
			top: 0,
			right: window.innerWidth,
			bottom: window.innerHeight,
		});
	});

	it('returns undefined for no bounds', () => {
		const node = document.createElement('div');
		expect(resolveResizeBounds(undefined, node)).toBeUndefined();
	});
});

describe('clampSizeToBounds (pure)', () => {
	const startRect = { left: 0, top: 0, right: 100, bottom: 80 };
	const bounds = { left: 0, top: 0, right: 150, bottom: 120 };

	it('limits an SE resize to the bound width/height', () => {
		const out = clampSizeToBounds(500, 500, 'se', bounds, startRect, 1);
		expect(out.width).toBe(150); // bounds.right - startRect.left
		expect(out.height).toBe(120); // bounds.bottom - startRect.top
	});

	it('does not clamp when within the bound', () => {
		const out = clampSizeToBounds(120, 100, 'se', bounds, startRect, 1);
		expect(out).toEqual({ width: 120, height: 100 });
	});

	it('clamps a W resize against the left bound (right edge fixed)', () => {
		// right edge fixed at startRect.right=100; bounds.left=20 → max width 80.
		const out = clampSizeToBounds(500, 80, 'w', { ...bounds, left: 20 }, startRect, 1);
		expect(out.width).toBe(80);
	});

	it('clamps an N resize against the top bound (bottom edge fixed)', () => {
		// bottom edge fixed at startRect.bottom=80; bounds.top=10 → max height 70.
		const out = clampSizeToBounds(100, 500, 'n', { ...bounds, top: 10 }, startRect, 1);
		expect(out.height).toBe(70);
	});

	it('scales slack by inverseScale', () => {
		// inverseScale 2 → element px space is double client space.
		const out = clampSizeToBounds(500, 500, 'se', bounds, startRect, 2);
		expect(out.width).toBe(300); // 150 * 2
		expect(out.height).toBe(240); // 120 * 2
	});
});

describe('Resize bounds option (DOM)', () => {
	it('clamps a resize to a bounds rect', () => {
		const { box, handle, dnd } = setup({
			bounds: { left: 0, top: 0, right: 150, bottom: 120 },
		});
		dnd.host.onInteractionStart(input(handle, 'start', 100, 80));
		dnd.host.onInteractionMove(input(handle, 'move', 999, 999));
		expect(box.style.width).toBe('150px');
		expect(box.style.height).toBe('120px');
		dnd.host.onInteractionEnd(input(handle, 'end', 999, 999));
	});

	it('allows resizing freely until the bound is reached', () => {
		const { box, handle, dnd } = setup({
			bounds: { left: 0, top: 0, right: 150, bottom: 120 },
		});
		dnd.host.onInteractionStart(input(handle, 'start', 100, 80));
		dnd.host.onInteractionMove(input(handle, 'move', 130, 110)); // → 130×110, inside bounds
		expect(box.style.width).toBe('130px');
		expect(box.style.height).toBe('110px');
		dnd.host.onInteractionEnd(input(handle, 'end', 130, 110));
	});

	it("resolves bounds='parent' from the DOM", () => {
		const parent = document.createElement('div');
		document.body.appendChild(parent);
		mockRect(parent, { left: 0, top: 0, right: 140, bottom: 110 });

		const box = document.createElement('div');
		const handle = document.createElement('div');
		handle.setAttribute('data-neodrag-resize-handle', 'se');
		box.appendChild(handle);
		parent.appendChild(box);
		mockRect(box, { left: 0, top: 0, right: 100, bottom: 80 });

		const dnd = new Interactions({ defaultSensors: false });
		const resize = new Resize();
		dnd.use(resize);
		resize.bind(box, { bounds: 'parent' });

		dnd.host.onInteractionStart(input(handle, 'start', 100, 80));
		dnd.host.onInteractionMove(input(handle, 'move', 999, 999));
		expect(box.style.width).toBe('140px');
		expect(box.style.height).toBe('110px');
		dnd.host.onInteractionEnd(input(handle, 'end', 999, 999));
	});

	it('keeps an explicit minWidth even under bounds', () => {
		const { box, handle, dnd } = setup(
			{ minWidth: 60, bounds: { left: 0, top: 0, right: 40, bottom: 200 } },
			'e',
		);
		dnd.host.onInteractionStart(input(handle, 'start', 100, 40));
		// bounds would clamp width to 40, but minWidth=60 wins.
		dnd.host.onInteractionMove(input(handle, 'move', 200, 40));
		expect(box.style.width).toBe('60px');
		dnd.host.onInteractionEnd(input(handle, 'end', 200, 40));
	});
});

describe('preserveUnits plugin', () => {
	it('round-trips a % width back to %', () => {
		// parent 200 wide; box authored at 50% (= 100px).
		const parent = document.createElement('div');
		document.body.appendChild(parent);
		mockRect(parent, { left: 0, top: 0, right: 200, bottom: 200 });
		Object.defineProperty(parent, 'offsetParent', { value: null, configurable: true });

		const box = document.createElement('div');
		const handle = document.createElement('div');
		handle.setAttribute('data-neodrag-resize-handle', 'se');
		box.appendChild(handle);
		parent.appendChild(box);
		box.style.width = '50%';
		box.style.height = '100px';
		mockRect(box, { left: 0, top: 0, right: 100, bottom: 100 }); // 100×100
		// box.offsetParent → parent, so % base resolves to parent rect.
		Object.defineProperty(box, 'offsetParent', { value: parent, configurable: true });

		const dnd = new Interactions({ defaultSensors: false });
		const resize = new Resize();
		dnd.use(resize);
		resize.bind(box, { use: [preserveUnits()] });

		dnd.host.onInteractionStart(input(handle, 'start', 100, 100));
		// grow width by 50px → 150px. Mid-drag the core writes plain px.
		dnd.host.onInteractionMove(input(handle, 'move', 150, 100));
		expect(box.style.width).toBe('150px');
		dnd.host.onInteractionEnd(input(handle, 'end', 150, 100));

		// committed back to %: 150 / 200 * 100 = 75%.
		expect(box.style.width).toBe('75%');
		// height was authored in px, so it stays px.
		expect(box.style.height).toBe('100px');
	});

	it('round-trips a rem height back to rem', () => {
		document.documentElement.style.fontSize = '16px';
		const realFs = getComputedStyle(document.documentElement).fontSize;
		// jsdom returns '16px' by default; assert our assumption.
		expect(realFs === '16px' || realFs === '').toBe(true);

		const box = document.createElement('div');
		const handle = document.createElement('div');
		handle.setAttribute('data-neodrag-resize-handle', 's');
		box.appendChild(handle);
		document.body.appendChild(box);
		box.style.width = '100px';
		box.style.height = '5rem'; // 80px at 16px root
		mockRect(box, { left: 0, top: 0, right: 100, bottom: 80 });

		const dnd = new Interactions({ defaultSensors: false });
		const resize = new Resize();
		dnd.use(resize);
		resize.bind(box, { use: [preserveUnits()] });

		dnd.host.onInteractionStart(input(handle, 'start', 100, 80));
		dnd.host.onInteractionMove(input(handle, 'move', 100, 160)); // +80px → 160px
		expect(box.style.height).toBe('160px');
		dnd.host.onInteractionEnd(input(handle, 'end', 100, 160));

		// 160 / 16 = 10rem
		expect(box.style.height).toBe('10rem');
		// width authored px → stays px.
		expect(box.style.width).toBe('100px');
	});

	it('leaves a px-authored size as px (no-op)', () => {
		const { box, handle, dnd } = setup({ use: [preserveUnits()] });
		box.style.width = '100px';
		box.style.height = '80px';
		dnd.host.onInteractionStart(input(handle, 'start', 100, 80));
		dnd.host.onInteractionMove(input(handle, 'move', 140, 100));
		dnd.host.onInteractionEnd(input(handle, 'end', 140, 100));
		expect(box.style.width).toBe('140px');
		expect(box.style.height).toBe('100px');
	});
});

describe('SVG resize', () => {
	const SVG_NS = 'http://www.w3.org/2000/svg';

	it('resizes an SVG rect via width/height attributes', () => {
		const svg = document.createElementNS(SVG_NS, 'svg');
		const rect = document.createElementNS(SVG_NS, 'rect');
		rect.setAttribute('width', '100');
		rect.setAttribute('height', '80');
		svg.appendChild(rect);
		document.body.appendChild(svg);

		mockRect(rect, { left: 0, top: 0, right: 100, bottom: 80 });
		// inverseScaleFromNode calls getBBox on SVG → stub it to match layout.
		(rect as unknown as SVGGraphicsElement).getBBox = () =>
			({ x: 0, y: 0, width: 100, height: 80 }) as DOMRect;

		const handle = document.createElement('div');
		handle.setAttribute('data-neodrag-resize-handle', 'se');
		document.body.appendChild(handle);

		const dnd = new Interactions({ defaultSensors: false });
		const resize = new Resize();
		dnd.use(resize);
		// Drive the resolve manually: the handle attr lives on an element whose owner
		// chain must reach the bound node. Put the handle inside an HTML wrapper that
		// owns the rect is awkward; instead bind the rect and place the handle in its path.
		resize.bind(rect, {});

		// Build an input whose composedPath includes the handle (with the attr) then the rect.
		const startEvt = svgInput(rect, handle, 'start', 100, 80);
		const moveEvt = svgInput(rect, handle, 'move', 150, 120);

		dnd.host.onInteractionStart(startEvt);
		dnd.host.onInteractionMove(moveEvt);

		expect(rect.getAttribute('width')).toBe('150');
		expect(rect.getAttribute('height')).toBe('120');
		// CSS style must NOT have been used for the geometry element.
		expect(rect.style.width).toBe('');
		dnd.host.onInteractionEnd(svgInput(rect, handle, 'end', 150, 120));
	});
});

/**
 * Build a programmatic input whose `target` carries the resize-handle attribute and whose
 * owner is the bound node. We attach the handle as a child of the bound node so the handle
 * lookup walks parentElement up to the owner. For SVG the bound node is the rect itself, so
 * we put the handle attribute directly on a child element of the rect.
 */
function svgInput(
	owner: Element,
	handle: HTMLElement,
	phase: 'start' | 'move' | 'end',
	x: number,
	y: number,
) {
	// Ensure handle is a child of owner so the owner-walk finds it.
	if (handle.parentElement !== owner) owner.appendChild(handle);
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target: handle });
}
