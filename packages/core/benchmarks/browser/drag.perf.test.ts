/**
 * Real Chromium benchmarks via Vitest browser + Playwright.
 */
import { describe, expect, it } from 'vitest';
import { DraggableFactory, DEFAULTS } from '../../src/index.ts';
import { Neodrag } from '../../src/interactions/index.ts';

function createBox() {
	const box = document.createElement('div');
	box.style.cssText =
		'position:absolute;left:100px;top:100px;width:120px;height:80px;touch-action:none;background:#4a9eff';
	document.body.appendChild(box);
	return box;
}

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

function pointer(target: HTMLElement, type: string, x: number, y: number, extra: PointerEventInit = {}) {
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

function drag12(target: HTMLElement, fromX: number, fromY: number, toX: number, toY: number) {
	const restore = patchPointerCapture();
	try {
		pointer(target, 'pointermove', fromX, fromY);
		pointer(target, 'pointerdown', fromX, fromY);
		for (let i = 1; i <= 12; i++) {
			const t = i / 12;
			pointer(target, 'pointermove', fromX + (toX - fromX) * t, fromY + (toY - fromY) * t);
		}
		pointer(target, 'pointerup', toX, toY);
	} finally {
		restore();
	}
}

function percentile(sorted: number[], p: number) {
	const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
	return sorted[i]!;
}

function summarize(samples: number[]) {
	const sorted = [...samples].sort((a, b) => a - b);
	const sum = sorted.reduce((a, b) => a + b, 0);
	return {
		n: sorted.length,
		mean: sum / sorted.length,
		median: percentile(sorted, 50),
		p99: percentile(sorted, 99),
		min: sorted[0]!,
		max: sorted[sorted.length - 1]!,
	};
}

function benchDrag(name: string, setup: () => () => void, iterations = 400) {
	const samples: number[] = [];
	const cleanup = setup();
	for (let i = 0; i < iterations; i++) {
		const t0 = performance.now();
		drag12(
			(document.querySelector('[data-bench-box]') as HTMLElement) ?? document.body,
			120,
			120,
			220,
			220,
		);
		samples.push(performance.now() - t0);
	}
	cleanup();
	const stats = summarize(samples);
	console.log(`[browser bench] ${name}`, JSON.stringify(stats));
	return stats;
}

describe('Chromium drag performance', () => {
	it('v3 steady-state 12-step drag', async () => {
		document.body.replaceChildren();
		const box = createBox();
		box.dataset.benchBox = '1';

		const factory = new DraggableFactory(DEFAULTS);
		const dispose = factory.draggable(box, []);

		const stats = benchDrag('v3', () => () => {
			dispose();
			factory.dispose();
			box.remove();
		});

		expect(stats.median).toBeLessThan(8);
	});

	it('v4 steady-state 12-step drag', async () => {
		document.body.replaceChildren();
		const box = createBox();
		box.dataset.benchBox = '1';

		const engine = new Neodrag({ dev: false });
		const handle = engine.draggable(box, []);

		const stats = benchDrag('v4', () => () => {
			handle.destroy();
			engine.dispose();
			box.remove();
		});

		expect(stats.median).toBeLessThan(12);
	});

	it('v4 matches v3 translate within tolerance', async () => {
		document.body.replaceChildren();

		const v3box = createBox();
		v3box.style.left = '100px';
		const v4box = createBox();
		v4box.style.left = '300px';

		const v3f = new DraggableFactory(DEFAULTS);
		const v3d = v3f.draggable(v3box, []);
		const v4e = new Neodrag({ dev: false });
		const v4d = v4e.draggable(v4box, []);

		drag12(v3box, 120, 120, 220, 220);
		drag12(v4box, 320, 120, 420, 220);

		await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

		const parse = (el: HTMLElement) => {
			const t = getComputedStyle(el).translate;
			if (!t || t === 'none') return { x: 0, y: 0 };
			const p = t.split(/\s+/);
			return { x: Number.parseFloat(p[0]!), y: Number.parseFloat(p[1]!) };
		};

		const a = parse(v3box);
		const b = parse(v4box);
		expect(Math.abs(a.x - b.x)).toBeLessThan(1);
		expect(Math.abs(a.y - b.y)).toBeLessThan(1);

		v3d();
		v4d.destroy();
		v3f.dispose();
		v4e.dispose();
	});
});
