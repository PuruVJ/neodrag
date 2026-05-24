export type BenchStats = {
	name: string;
	iterations: number;
	hz: number;
	meanMs: number;
	medianMs: number;
	p99Ms: number;
	minMs: number;
	maxMs: number;
};

export function resetBody() {
	document.body.replaceChildren();
	document.body.style.cssText = 'margin:0;min-height:100vh;position:relative';
}

export function parseTranslate(el: HTMLElement) {
	const t = getComputedStyle(el).translate;
	if (!t || t === 'none') return { x: 0, y: 0 };
	const p = t.split(/\s+/);
	return { x: Number.parseFloat(p[0]!), y: Number.parseFloat(p[1]!) };
}

export function assertTranslate(
	el: HTMLElement,
	expected: { x: number; y: number },
	tolerance = 2,
) {
	const { x, y } = parseTranslate(el);
	if (Math.abs(x - expected.x) > tolerance || Math.abs(y - expected.y) > tolerance) {
		throw new Error(
			`translate expected (${expected.x}, ${expected.y}) within ±${tolerance}, got (${x}, ${y})`,
		);
	}
}

export function patchPointerCapture() {
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

export function pointer(
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

export function dragElementByDelta(
	el: HTMLElement,
	deltaX: number,
	deltaY: number,
	steps = 12,
) {
	const rect = el.getBoundingClientRect();
	const fromX = rect.left + rect.width / 2;
	const fromY = rect.top + rect.height / 2;
	dragSteps(el, fromX, fromY, fromX + deltaX, fromY + deltaY, steps);
}

export function dragSteps(
	target: HTMLElement,
	fromX: number,
	fromY: number,
	toX: number,
	toY: number,
	steps = 12,
) {
	const restore = patchPointerCapture();
	try {
		pointer(target, 'pointermove', fromX, fromY);
		pointer(target, 'pointerdown', fromX, fromY);
		for (let i = 1; i <= steps; i++) {
			const t = i / steps;
			pointer(
				target,
				'pointermove',
				fromX + (toX - fromX) * t,
				fromY + (toY - fromY) * t,
			);
		}
		pointer(target, 'pointerup', toX, toY);
	} finally {
		restore();
	}
}

export function flushEffects() {
	return new Promise<void>((resolve) =>
		requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
	);
}

export function createBox(left = '100px', top = '100px') {
	const box = document.createElement('div');
	box.style.cssText = `position:absolute;left:${left};top:${top};width:120px;height:80px;touch-action:none;background:#4a9eff`;
	document.body.appendChild(box);
	return box;
}

function percentile(sorted: number[], p: number) {
	const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
	return sorted[i]!;
}

export function summarize(name: string, samples: number[]): BenchStats {
	const sorted = [...samples].sort((a, b) => a - b);
	const sum = sorted.reduce((a, b) => a + b, 0);
	const meanMs = sum / sorted.length;
	return {
		name,
		iterations: sorted.length,
		hz: 1000 / meanMs,
		meanMs,
		medianMs: percentile(sorted, 50),
		p99Ms: percentile(sorted, 99),
		minMs: sorted[0]!,
		maxMs: sorted[sorted.length - 1]!,
	};
}

export function runBench(
	name: string,
	iterations: number,
	warmup: number,
	fn: () => void,
): BenchStats {
	for (let i = 0; i < warmup; i++) fn();
	const samples: number[] = [];
	for (let i = 0; i < iterations; i++) {
		const t0 = performance.now();
		fn();
		samples.push(performance.now() - t0);
	}
	return summarize(name, samples);
}

export function formatComparison(results: BenchStats[]) {
	const rows = results.map((r) => ({
		benchmark: r.name,
		'hz': Math.round(r.hz),
		'mean (ms)': +r.meanMs.toFixed(3),
		'median (ms)': +r.medianMs.toFixed(3),
		'p99 (ms)': +r.p99Ms.toFixed(3),
		'min (ms)': +r.minMs.toFixed(3),
		'max (ms)': +r.maxMs.toFixed(3),
	}));
	return rows;
}

export function ratioLabel(a: BenchStats, b: BenchStats) {
	const faster = a.meanMs <= b.meanMs ? a : b;
	const slower = a.meanMs <= b.meanMs ? b : a;
	const mult = slower.meanMs / faster.meanMs;
	return `${faster.name} is ${mult.toFixed(2)}× faster than ${slower.name} (mean)`;
}

export type TwoWayBindingBench = {
	engine: import('../../src/index.ts').Neodrag;
	box: HTMLElement;
	handle: import('../../src/index.ts').DragHandle;
	pos: { x: number; y: number };
	build: () => import('../../src/index.ts').DragPlugin[];
};

export function setupTwoWayBinding(
	Neodrag: typeof import('../../src/index.ts').Neodrag,
	position: typeof import('../../src/index.ts').position,
	transform: typeof import('../../src/index.ts').transform,
	events: typeof import('../../src/index.ts').events,
	left?: string,
	top?: string,
): TwoWayBindingBench {
	const leftPos = left ?? '100px';
	const topPos = top ?? '100px';
	const engine = new Neodrag({ dev: false });
	const box = createBox(leftPos, topPos);
	const pos = { x: 0, y: 0 };
	const build = () => [
		transform,
		position({ current: { x: pos.x, y: pos.y } }),
		events({
			onDrag(data) {
				pos.x = data.offset.x;
				pos.y = data.offset.y;
			},
		}),
	];
	const handle = engine.draggable(box, build());
	return { engine, box, handle, pos, build };
}

export function setupManyDraggables(
	count: number,
	engine: import('../../src/index.ts').Neodrag,
	plugins: import('../../src/index.ts').DragPlugin[] = [],
) {
	const handles: import('../../src/index.ts').DragHandle[] = [];
	const root = document.createElement('div');
	root.style.cssText =
		'position:absolute;left:20px;top:20px;display:grid;grid-template-columns:repeat(10,72px);gap:8px';
	document.body.appendChild(root);

	for (let i = 0; i < count; i++) {
		const el = document.createElement('div');
		el.style.cssText = 'width:64px;height:48px;background:#7ec8e3;touch-action:none';
		root.appendChild(el);
		handles.push(engine.draggable(el, plugins));
	}

	return { root, handles, first: root.firstElementChild as HTMLElement };
}

export function printBenchReport(title: string, results: BenchStats[], comparisons: [BenchStats, BenchStats][] = []) {
	console.log(`\n=== ${title} ===\n`);
	console.table(formatComparison(results));
	if (comparisons.length) {
		console.log('\nComparisons:');
		for (const [a, b] of comparisons) console.log(' ·', ratioLabel(a, b));
	}
	console.log('\nJSON:', JSON.stringify(results, null, 2));
}
